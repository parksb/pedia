import {
  type ContainerHandler,
  loadScript,
  registerContainer,
} from "../container.ts";

interface GraphNode {
  id: string;
  label: string;
  category: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

type Point = { x: number; y: number };
type Transform = { x: number; y: number; k: number };

const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";
const ROOT_NODE = "simonpedia";

function edgeEndpoints(edge: GraphEdge): [string, string] {
  return [
    typeof edge.source === "string" ? edge.source : edge.source.id,
    typeof edge.target === "string" ? edge.target : edge.target.id,
  ];
}

function navigateTo(id: string): void {
  const a = document.createElement("a");
  a.href = `/${id}`;
  a.setAttribute("hx-get", `/swap/${id}`);
  a.setAttribute("hx-target", "#main");
  a.setAttribute("hx-push-url", `/${id}`);
  a.setAttribute("hx-swap", "show:top");
  a.setAttribute("hx-on:click", `select('${id}') && scrollToActive()`);
  document.body.appendChild(a);
  htmx.process(a);
  a.click();
  a.remove();
}

function buildAdjacency(edges: GraphEdge[]): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const edge of edges) {
    const [s, t] = edgeEndpoints(edge);
    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s)!.add(t);
    adj.get(t)!.add(s);
  }
  return adj;
}

function buildLinkCount(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    const [s, t] = edgeEndpoints(edge);
    counts.set(s, (counts.get(s) ?? 0) + 1);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

function buildClusterPositions(
  categories: string[],
  width: number,
  height: number,
): Map<string, Point> {
  const radius = Math.min(width, height) * 0.3;
  return new Map(categories.map((cat, i) => {
    const angle = (2 * Math.PI * i) / categories.length;
    return [cat, {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    }] as const;
  }));
}

function blendColors(weighted: { color: string; weight: number }[]): string {
  const { r, g, b, total } = weighted.reduce(
    (acc, { color, weight }) => {
      const rgb = d3.color(color).rgb();
      return {
        r: acc.r + rgb.r * weight,
        g: acc.g + rgb.g * weight,
        b: acc.b + rgb.b * weight,
        total: acc.total + weight,
      };
    },
    { r: 0, g: 0, b: 0, total: 0 },
  );
  return d3.rgb(r / total, g / total, b / total).formatHex();
}

function buildNodeColors(
  nodes: GraphNode[],
  edges: GraphEdge[],
  categoryColor: (cat: string) => string,
): Map<string, string> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const cats = new Map(nodes.map((n) => [n.id, new Set([n.category])]));
  for (const edge of edges) {
    const [s, t] = edgeEndpoints(edge);
    const sn = nodeMap.get(s), tn = nodeMap.get(t);
    if (sn && tn) {
      cats.get(s)!.add(tn.category);
      cats.get(t)!.add(sn.category);
    }
  }
  return new Map(nodes.map((node) => {
    const unique = [...cats.get(node.id)!];
    if (unique.length === 1 || node.id === node.category) {
      return [node.id, categoryColor(node.category)];
    }
    return [
      node.id,
      blendColors(
        unique.map((c) => ({
          color: categoryColor(c),
          weight: c === node.category ? 3 : 1,
        })),
      ),
    ];
  }));
}

function buildNodeTargets(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Map<string, Point>,
): Map<string, Point> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const weights = new Map(
    nodes.map((n) => [n.id, new Map<string, number>([[n.category, 3]])]),
  );
  for (const edge of edges) {
    const [s, t] = edgeEndpoints(edge);
    const sn = nodeMap.get(s), tn = nodeMap.get(t);
    if (sn && tn) {
      const sw = weights.get(s)!;
      sw.set(tn.category, (sw.get(tn.category) ?? 0) + 1);
      const tw = weights.get(t)!;
      tw.set(sn.category, (tw.get(sn.category) ?? 0) + 1);
    }
  }
  return new Map(nodes.map((node) => {
    let x = 0, y = 0, total = 0;
    for (const [cat, w] of weights.get(node.id)!) {
      const pos = clusters.get(cat)!;
      x += pos.x * w;
      y += pos.y * w;
      total += w;
    }
    return [node.id, { x: x / total, y: y / total }] as const;
  }));
}

function initNodePositions(
  nodes: GraphNode[],
  targets: Map<string, Point>,
  w: number,
  h: number,
): void {
  for (const node of nodes) {
    if (node.id === ROOT_NODE) {
      node.x = w / 2;
      node.y = h / 2;
      node.fx = w / 2;
      node.fy = h / 2;
    } else {
      const pos = targets.get(node.id)!;
      node.x = pos.x + (Math.random() - 0.5) * 80;
      node.y = pos.y + (Math.random() - 0.5) * 80;
    }
  }
}

function createSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  targets: Map<string, Point>,
) {
  return d3
    .forceSimulation(nodes)
    .alpha(0.3)
    .alphaDecay(0.03)
    .velocityDecay(0.6)
    .force(
      "link",
      d3.forceLink(edges).id((d: GraphNode) => d.id).distance(
        (e: GraphEdge) => {
          const [s, t] = edgeEndpoints(e);
          return (s === ROOT_NODE || t === ROOT_NODE) ? 300 : 100;
        },
      ),
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force("x", d3.forceX((d: GraphNode) => targets.get(d.id)!.x).strength(0.3))
    .force("y", d3.forceY((d: GraphNode) => targets.get(d.id)!.y).strength(0.3))
    .force("collision", d3.forceCollide().radius(16));
}

const nodeRadius = (d: GraphNode, linkCount: Map<string, number>) =>
  3 + Math.log2(1 + (linkCount.get(d.id) ?? 0)) * 4;

function setupCanvas(container: HTMLElement, w: number, h: number) {
  const dpr = globalThis.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  container.appendChild(canvas);
  return { canvas, ctx };
}

function hitTest(
  nodes: GraphNode[],
  linkCount: Map<string, number>,
  sx: number,
  sy: number,
  t: Transform,
): GraphNode | null {
  const gx = (sx - t.x) / t.k;
  const gy = (sy - t.y) / t.k;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const r = nodeRadius(node, linkCount);
    const dx = (node.x ?? 0) - gx;
    const dy = (node.y ?? 0) - gy;
    if (dx * dx + dy * dy <= r * r) return node;
  }
  return null;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  nodes: GraphNode[],
  edges: GraphEdge[],
  linkCount: Map<string, number>,
  nodeColors: Map<string, string>,
  adjacency: Map<string, Set<string>>,
  t: Transform,
  hoveredNode: GraphNode | null,
  fadeRadius: number,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(t.k, t.k);

  const pw = 1 / t.k;
  const connected = hoveredNode
    ? new Set([hoveredNode.id, ...(adjacency.get(hoveredNode.id) ?? [])])
    : null;

  const pathDim = new Path2D();
  const pathActive = new Path2D();

  for (const edge of edges) {
    const src = edge.source as GraphNode;
    const tgt = edge.target as GraphNode;
    const [s, tr] = edgeEndpoints(edge);
    const isActive = connected &&
      (s === hoveredNode!.id || tr === hoveredNode!.id);
    const path = isActive ? pathActive : pathDim;
    path.moveTo(src.x!, src.y!);
    path.lineTo(tgt.x!, tgt.y!);
  }

  ctx.lineWidth = pw;
  ctx.strokeStyle = "#ccc";
  ctx.globalAlpha = connected ? 0.05 : 0.6;
  ctx.stroke(pathDim);

  if (connected) {
    ctx.globalAlpha = 0.8;
    ctx.stroke(pathActive);
  }

  for (const node of nodes) {
    const r = nodeRadius(node, linkCount);
    ctx.globalAlpha = connected ? (connected.has(node.id) ? 1 : 0.1) : 1;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, r, 0, Math.PI * 2);
    ctx.fillStyle = nodeColors.get(node.id)!;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5 * pw;
    ctx.stroke();
  }

  if (t.k >= 0.7) {
    const cx = (w / 2 - t.x) / t.k;
    const cy = (h / 2 - t.y) / t.k;
    ctx.font = `${10 * pw}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.lineWidth = 2 * pw;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";

    for (const node of nodes) {
      const alpha = connected ? (connected.has(node.id) ? 1 : 0.1) : Math.max(
        0,
        1 -
          Math.hypot((node.x ?? 0) - cx, (node.y ?? 0) - cy) /
            (fadeRadius * pw),
      );
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.strokeText(node.label, node.x! + 8 * pw, node.y! + 3 * pw);
      ctx.fillStyle = "#333";
      ctx.fillText(node.label, node.x! + 8 * pw, node.y! + 3 * pw);
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function createGraphHandler(): ContainerHandler {
  let simulation: ReturnType<typeof d3.forceSimulation> | null = null;
  let rafId: number | null = null;

  return {
    async init(container: HTMLElement): Promise<void> {
      simulation?.stop();
      simulation = null;
      container.replaceChildren();
      await loadScript(D3_CDN);

      const { nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] } =
        await fetch("/api/graph").then((r) => r.json());

      const adjacency = buildAdjacency(edges);
      const linkCount = buildLinkCount(edges);
      const { clientWidth: w, clientHeight: h } = container;
      const fadeRadius = Math.min(w, h) * 0.8;

      const categories = [...new Set(nodes.map((n) => n.category))];
      const categoryColor = d3.scaleOrdinal(d3.schemeObservable10).domain(
        categories,
      );
      const clusters = buildClusterPositions(categories, w, h);
      const nodeTargets = buildNodeTargets(nodes, edges, clusters);
      const nodeColors = buildNodeColors(nodes, edges, categoryColor);

      initNodePositions(nodes, nodeTargets, w, h);

      const { canvas, ctx } = setupCanvas(container, w, h);

      let transform: Transform = { x: 0, y: 0, k: 1 };
      let hoveredNode: GraphNode | null = null;
      let dragNode: GraphNode | null = null;
      let isPanning = false;
      let panStart: Point = { x: 0, y: 0 };
      let panOrigin: Point = { x: 0, y: 0 };
      let mouseDownPos: Point = { x: 0, y: 0 };
      let clickCandidate: GraphNode | null = null;

      const render = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          drawFrame(
            ctx,
            w,
            h,
            nodes,
            edges,
            linkCount,
            nodeColors,
            adjacency,
            transform,
            hoveredNode,
            fadeRadius,
          );
        });
      };

      const screenToGraph = (sx: number, sy: number): Point => ({
        x: (sx - transform.x) / transform.k,
        y: (sy - transform.y) / transform.k,
      });

      const clientPos = (e: MouseEvent): Point => {
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };

      canvas.addEventListener("mousedown", (e: MouseEvent) => {
        const { x, y } = clientPos(e);
        mouseDownPos = { x, y };
        const node = hitTest(nodes, linkCount, x, y, transform);
        if (node) {
          dragNode = node;
          clickCandidate = node;
          node.fx = node.x;
          node.fy = node.y;
          simulation!.alphaTarget(0.3).restart();
        } else {
          isPanning = true;
          panStart = { x, y };
          panOrigin = { x: transform.x, y: transform.y };
          canvas.style.cursor = "grabbing";
        }
      });

      canvas.addEventListener("mousemove", (e: MouseEvent) => {
        const { x, y } = clientPos(e);
        if (dragNode) {
          const g = screenToGraph(x, y);
          dragNode.fx = g.x;
          dragNode.fy = g.y;
          render();
        } else if (isPanning) {
          transform = {
            ...transform,
            x: panOrigin.x + x - panStart.x,
            y: panOrigin.y + y - panStart.y,
          };
          render();
        } else {
          const node = hitTest(nodes, linkCount, x, y, transform);
          if (node !== hoveredNode) {
            hoveredNode = node;
            canvas.style.cursor = node ? "pointer" : "default";
            render();
          }
        }
      });

      canvas.addEventListener("mouseup", (e: MouseEvent) => {
        const { x, y } = clientPos(e);
        const dx = x - mouseDownPos.x;
        const dy = y - mouseDownPos.y;
        const moved = dx * dx + dy * dy > 25;

        if (dragNode) {
          simulation!.alphaTarget(0.01);
          dragNode.fx = null;
          dragNode.fy = null;
          if (!moved && clickCandidate === dragNode) navigateTo(dragNode.id);
          dragNode = null;
          clickCandidate = null;
        }

        isPanning = false;
        canvas.style.cursor = hoveredNode ? "pointer" : "default";
      });

      canvas.addEventListener("mouseleave", () => {
        if (dragNode) {
          simulation!.alphaTarget(0.01);
          dragNode.fx = null;
          dragNode.fy = null;
          dragNode = null;
          clickCandidate = null;
        }
        isPanning = false;
        hoveredNode = null;
        canvas.style.cursor = "default";
        render();
      });

      canvas.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault();
        const { x, y } = clientPos(e);
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const newK = Math.max(0.1, Math.min(4, transform.k * factor));
        const scale = newK / transform.k;
        transform = {
          k: newK,
          x: x - (x - transform.x) * scale,
          y: y - (y - transform.y) * scale,
        };
        render();
      }, { passive: false });

      simulation = createSimulation(nodes, edges, nodeTargets);
      simulation.on("tick", render);
    },

    destroy(): void {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      simulation?.stop();
      simulation = null;
    },
  };
}

registerContainer("graph", createGraphHandler);
