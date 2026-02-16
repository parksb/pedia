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

function blendColors(
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
    .force(
      "x",
      d3.forceX((d: GraphNode) => targets.get(d.id)!.x).strength(0.3),
    )
    .force(
      "y",
      d3.forceY((d: GraphNode) => targets.get(d.id)!.y).strength(0.3),
    )
    .force("collision", d3.forceCollide().radius(16));
}

function makeDrag(sim: ReturnType<typeof d3.forceSimulation>) {
  return d3
    .drag()
    .on("start", (e: { active: number; subject: GraphNode }) => {
      if (!e.active) sim.alphaTarget(0.3).restart();
      e.subject.fx = e.subject.x;
      e.subject.fy = e.subject.y;
    })
    .on("drag", (e: { subject: GraphNode; x: number; y: number }) => {
      e.subject.fx = e.x;
      e.subject.fy = e.y;
    })
    .on("end", (e: { active: number; subject: GraphNode }) => {
      if (!e.active) sim.alphaTarget(0.01);
      e.subject.fx = null;
      e.subject.fy = null;
    });
}

function createGraphHandler(): ContainerHandler {
  let simulation: ReturnType<typeof d3.forceSimulation> | null = null;

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

      const categories = [...new Set(nodes.map((n) => n.category))];
      const categoryColor = d3.scaleOrdinal(d3.schemeObservable10).domain(
        categories,
      );
      const clusters = buildClusterPositions(categories, w, h);
      const nodeTargets = buildNodeTargets(nodes, edges, clusters);
      const nodeColors = buildNodeColors(nodes, edges, categoryColor);

      initNodePositions(nodes, nodeTargets, w, h);

      const svg = d3.select(container).append("svg").attr("width", w).attr(
        "height",
        h,
      );
      const g = svg.append("g");

      let currentTransform = d3.zoomIdentity;
      const fadeRadius = Math.min(w, h) * 0.8;

      function updateLabelOpacity() {
        if (currentTransform.k < 0.7) {
          label.attr("opacity", 0);
          return;
        }
        const cx = (w / 2 - currentTransform.x) / currentTransform.k;
        const cy = (h / 2 - currentTransform.y) / currentTransform.k;
        label.attr("opacity", (d: GraphNode) => {
          const dx = (d.x ?? 0) - cx;
          const dy = (d.y ?? 0) - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return Math.max(0, 1 - dist / (fadeRadius / currentTransform.k));
        });
      }

      svg.call(
        d3.zoom().scaleExtent([0.1, 4]).on(
          "zoom",
          (e: { transform: typeof d3.zoomIdentity }) => {
            currentTransform = e.transform;
            g.attr("transform", e.transform);
            updateLabelOpacity();
          },
        ),
      );

      simulation = createSimulation(nodes, edges, nodeTargets);

      const link = g.append("g").selectAll("line").data(edges).join("line")
        .attr("stroke", "#ccc")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

      const nodeRadius = (d: GraphNode) =>
        3 + Math.log2(1 + (linkCount.get(d.id) ?? 0)) * 4;

      const node = g.append("g").selectAll("circle").data(nodes).join("circle")
        .attr("r", nodeRadius)
        .attr("fill", (d: GraphNode) => nodeColors.get(d.id)!)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("cursor", "pointer")
        .call(makeDrag(simulation));

      const labelGroup = g.append("g");
      const label = labelGroup.selectAll("text").data(nodes).join("text")
        .text((d: GraphNode) => d.label)
        .attr("font-size", 10)
        .attr("dx", 8)
        .attr("dy", 3)
        .attr("pointer-events", "none")
        .attr("fill", "#333")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("paint-order", "stroke");

      node
        .on("mouseover", (_: MouseEvent, d: GraphNode) => {
          const neighbors = adjacency.get(d.id) ?? new Set();
          const connected = new Set([d.id, ...neighbors]);
          node.attr(
            "opacity",
            (n: GraphNode) => connected.has(n.id) ? 1 : 0.1,
          );
          label.attr(
            "opacity",
            (n: GraphNode) => connected.has(n.id) ? 1 : 0.1,
          );
          link.attr("stroke-opacity", (e: GraphEdge) => {
            const [s, t] = edgeEndpoints(e);
            return (s === d.id || t === d.id) ? 0.8 : 0.05;
          });
        })
        .on("mouseout", () => {
          node.attr("opacity", 1);
          updateLabelOpacity();
          link.attr("stroke-opacity", 0.6);
        })
        .on("click", (_: MouseEvent, d: GraphNode) => navigateTo(d.id));

      simulation.on("tick", () => {
        link
          .attr("x1", (d: GraphEdge) => (d.source as GraphNode).x!)
          .attr("y1", (d: GraphEdge) => (d.source as GraphNode).y!)
          .attr("x2", (d: GraphEdge) => (d.target as GraphNode).x!)
          .attr("y2", (d: GraphEdge) => (d.target as GraphNode).y!);
        node.attr("cx", (d: GraphNode) => d.x!).attr(
          "cy",
          (d: GraphNode) => d.y!,
        );
        label.attr("x", (d: GraphNode) => d.x!).attr(
          "y",
          (d: GraphNode) => d.y!,
        );
        updateLabelOpacity();
      });
    },

    destroy(): void {
      simulation?.stop();
      simulation = null;
    },
  };
}

registerContainer("graph", createGraphHandler);
