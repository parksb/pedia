export interface GraphNode {
  id: string;
  label: string;
  category: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

export type Point = { x: number; y: number };
export type Transform = { x: number; y: number; k: number };

export const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";

export function edgeEndpoints(edge: GraphEdge): [string, string] {
  return [
    typeof edge.source === "string" ? edge.source : edge.source.id,
    typeof edge.target === "string" ? edge.target : edge.target.id,
  ];
}

export function navigateTo(id: string): void {
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

export function buildAdjacency(edges: GraphEdge[]): Map<string, Set<string>> {
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

export function buildLinkCount(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    const [s, t] = edgeEndpoints(edge);
    counts.set(s, (counts.get(s) ?? 0) + 1);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

export const nodeRadius = (d: GraphNode, linkCount: Map<string, number>) =>
  3 + Math.log2(1 + (linkCount.get(d.id) ?? 0)) * 4;

export function setupCanvas(container: HTMLElement, w: number, h: number) {
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

export function hitTest(
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

export function drawFrame(
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
  labelMinZoom = 0.7,
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

  ctx.font = `${10 * pw}px sans-serif`;
  ctx.textBaseline = "middle";
  ctx.lineWidth = 2 * pw;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#fff";

  if (t.k >= labelMinZoom) {
    const cx = (w / 2 - t.x) / t.k;
    const cy = (h / 2 - t.y) / t.k;

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
  } else if (hoveredNode) {
    ctx.globalAlpha = 1;
    ctx.strokeText(
      hoveredNode.label,
      hoveredNode.x! + 8 * pw,
      hoveredNode.y! + 3 * pw,
    );
    ctx.fillStyle = "#333";
    ctx.fillText(
      hoveredNode.label,
      hoveredNode.x! + 8 * pw,
      hoveredNode.y! + 3 * pw,
    );
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

export function blendColors(
  weighted: { color: string; weight: number }[],
): string {
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

export function attachInteractionHandlers(opts: {
  canvas: HTMLCanvasElement;
  nodes: GraphNode[];
  linkCount: Map<string, number>;
  simulation: { alphaTarget(a: number): { restart(): void } };
  getTransform: () => Transform;
  setTransform: (t: Transform) => void;
  draw: (hoveredNode: GraphNode | null) => void;
  shouldRelease?: (node: GraphNode) => boolean;
}): { render: () => void } {
  const {
    canvas,
    nodes,
    linkCount,
    simulation,
    getTransform,
    setTransform,
    draw,
    shouldRelease = () => true,
  } = opts;

  let hoveredNode: GraphNode | null = null;
  let dragNode: GraphNode | null = null;
  let isPanning = false;
  let panStart: Point = { x: 0, y: 0 };
  let panOrigin: Point = { x: 0, y: 0 };
  let mouseDownPos: Point = { x: 0, y: 0 };
  let clickCandidate: GraphNode | null = null;
  let rafId: number | null = null;

  const render = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      draw(hoveredNode);
    });
  };

  const clientPos = (e: MouseEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const screenToGraph = (sx: number, sy: number): Point => {
    const t = getTransform();
    return { x: (sx - t.x) / t.k, y: (sy - t.y) / t.k };
  };

  const releaseDrag = () => {
    if (!dragNode) return;
    simulation.alphaTarget(0.01);
    if (shouldRelease(dragNode)) {
      dragNode.fx = null;
      dragNode.fy = null;
    }
    dragNode = null;
    clickCandidate = null;
  };

  canvas.addEventListener("mousedown", (e: MouseEvent) => {
    const { x, y } = clientPos(e);
    mouseDownPos = { x, y };
    const node = hitTest(nodes, linkCount, x, y, getTransform());
    if (node) {
      dragNode = node;
      clickCandidate = node;
      node.fx = node.x;
      node.fy = node.y;
      simulation.alphaTarget(0.3).restart();
    } else {
      isPanning = true;
      panStart = { x, y };
      const t = getTransform();
      panOrigin = { x: t.x, y: t.y };
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
      const t = getTransform();
      setTransform({
        ...t,
        x: panOrigin.x + x - panStart.x,
        y: panOrigin.y + y - panStart.y,
      });
      render();
    } else {
      const node = hitTest(nodes, linkCount, x, y, getTransform());
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
      const clicked = !moved && clickCandidate === dragNode;
      const id = dragNode.id;
      releaseDrag();
      if (clicked) navigateTo(id);
    }

    isPanning = false;
    canvas.style.cursor = hoveredNode ? "pointer" : "default";
  });

  canvas.addEventListener("mouseleave", () => {
    releaseDrag();
    isPanning = false;
    hoveredNode = null;
    canvas.style.cursor = "default";
    render();
  });

  canvas.addEventListener("wheel", (e: WheelEvent) => {
    e.preventDefault();
    const { x, y } = clientPos(e);
    const t = getTransform();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newK = Math.max(0.1, Math.min(4, t.k * factor));
    const scale = newK / t.k;
    setTransform({
      k: newK,
      x: x - (x - t.x) * scale,
      y: y - (y - t.y) * scale,
    });
    render();
  }, { passive: false });

  return { render };
}

export function buildNodeColors(
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
