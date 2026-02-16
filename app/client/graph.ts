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

const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";

let simulation: ReturnType<typeof d3.forceSimulation> | null = null;

function edgeId(edge: GraphEdge): [string, string] {
  return [
    typeof edge.source === "string" ? edge.source : edge.source.id,
    typeof edge.target === "string" ? edge.target : edge.target.id,
  ];
}

function loadScript(src: string): Promise<void> {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = reject;
    document.head.appendChild(el);
  });
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

function buildLinkCount(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    const [s, t] = edgeId(edge);
    counts.set(s, (counts.get(s) ?? 0) + 1);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return counts;
}

function buildClusterPositions(
  categories: string[],
  width: number,
  height: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const radius = Math.min(width, height) * 0.3;
  for (let i = 0; i < categories.length; i++) {
    const angle = (2 * Math.PI * i) / categories.length;
    positions.set(categories[i], {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    });
  }
  return positions;
}

function createSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: Map<string, { x: number; y: number }>,
) {
  return d3
    .forceSimulation(nodes)
    .alpha(0.3)
    .alphaDecay(0.03)
    .velocityDecay(0.6)
    .force(
      "link",
      d3.forceLink(edges).id((d: GraphNode) => d.id).distance(60),
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force(
      "x",
      d3.forceX((d: GraphNode) => clusters.get(d.category)!.x).strength(0.1),
    )
    .force(
      "y",
      d3.forceY((d: GraphNode) => clusters.get(d.category)!.y).strength(0.1),
    )
    .force("collision", d3.forceCollide().radius(12));
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
      if (!e.active) sim.alphaTarget(0);
      e.subject.fx = null;
      e.subject.fy = null;
    });
}

export async function initGraph(): Promise<void> {
  simulation?.stop();
  simulation = null;

  const container = document.getElementById("graph-container");
  if (!container) return;

  container.replaceChildren();
  await loadScript(D3_CDN);

  const { nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] } =
    await fetch("/api/graph").then((r) => r.json());

  const linkCount = buildLinkCount(edges);

  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    const [s, t] = edgeId(edge);
    if (!adjacency.has(s)) adjacency.set(s, new Set());
    if (!adjacency.has(t)) adjacency.set(t, new Set());
    adjacency.get(s)!.add(t);
    adjacency.get(t)!.add(s);
  }

  const { clientWidth: w, clientHeight: h } = container;

  const categories = [...new Set(nodes.map((n) => n.category))];
  const categoryColor = d3.scaleOrdinal(d3.schemeObservable10).domain(
    categories,
  );
  const clusters = buildClusterPositions(categories, w, h);

  for (const node of nodes) {
    if (node.id === "simonpedia") {
      node.x = w / 2;
      node.y = h / 2;
      node.fx = w / 2;
      node.fy = h / 2;
    } else {
      const pos = clusters.get(node.category)!;
      node.x = pos.x + (Math.random() - 0.5) * 80;
      node.y = pos.y + (Math.random() - 0.5) * 80;
    }
  }

  const svg = d3.select(container).append("svg").attr("width", w).attr(
    "height",
    h,
  );
  const g = svg.append("g");

  let labelsVisible = true;
  svg.call(
    d3.zoom().scaleExtent([0.1, 4]).on(
      "zoom",
      (e: { transform: { k: number } }) => {
        g.attr("transform", e.transform);
        const show = e.transform.k >= 0.7;
        if (show !== labelsVisible) {
          labelsVisible = show;
          labelGroup.attr("display", show ? null : "none");
          if (show) {
            label.attr("x", (d: GraphNode) => d.x!).attr(
              "y",
              (d: GraphNode) => d.y!,
            );
          }
        }
      },
    ),
  );

  simulation = createSimulation(nodes, edges, clusters);

  const link = g.append("g").selectAll("line").data(edges).join("line")
    .attr("stroke", "#ccc")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 1);

  const nodeRadius = (d: GraphNode) =>
    Math.min(Math.max(3 + (linkCount.get(d.id) ?? 0) * 0.8, 4), 20);

  const node = g.append("g").selectAll("circle").data(nodes).join("circle")
    .attr("r", nodeRadius)
    .attr("fill", (d: GraphNode) => categoryColor(d.category))
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
    .attr("fill", "#333");

  node
    .on("mouseover", (_: MouseEvent, d: GraphNode) => {
      const neighbors = adjacency.get(d.id) ?? new Set();
      const connected = new Set([d.id, ...neighbors]);
      node.attr("opacity", (n: GraphNode) => connected.has(n.id) ? 1 : 0.1);
      if (labelsVisible) {
        label.attr("opacity", (n: GraphNode) => connected.has(n.id) ? 1 : 0.1);
      }
      link.attr("stroke-opacity", (e: GraphEdge) => {
        const [s, t] = edgeId(e);
        return (s === d.id || t === d.id) ? 0.8 : 0.05;
      });
    })
    .on("mouseout", () => {
      node.attr("opacity", 1);
      if (labelsVisible) label.attr("opacity", 1);
      link.attr("stroke-opacity", 0.6);
    })
    .on("click", (_: MouseEvent, d: GraphNode) => navigateTo(d.id));

  simulation.on("tick", () => {
    link
      .attr("x1", (d: GraphEdge) => (d.source as GraphNode).x!)
      .attr("y1", (d: GraphEdge) => (d.source as GraphNode).y!)
      .attr("x2", (d: GraphEdge) => (d.target as GraphNode).x!)
      .attr("y2", (d: GraphEdge) => (d.target as GraphNode).y!);
    node.attr("cx", (d: GraphNode) => d.x!).attr("cy", (d: GraphNode) => d.y!);
    if (labelsVisible) {
      label.attr("x", (d: GraphNode) => d.x!).attr("y", (d: GraphNode) => d.y!);
    }
  });
}
