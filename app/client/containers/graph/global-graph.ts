import {
  type ContainerHandler,
  loadScript,
  registerContainer,
} from "../../container.ts";
import {
  attachInteractionHandlers,
  buildAdjacency,
  buildLinkCount,
  buildNodeColors,
  D3_CDN,
  drawFrame,
  edgeEndpoints,
  type GraphEdge,
  type GraphNode,
  type Point,
  setupCanvas,
  type Transform,
} from "./utils.ts";

const ROOT_NODE = "simonpedia";

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

      const k0 = 0.6;
      let transform: Transform = {
        x: w * (1 - k0) / 2,
        y: h * (1 - k0) / 2,
        k: k0,
      };

      simulation = createSimulation(nodes, edges, nodeTargets);

      const { render } = attachInteractionHandlers({
        canvas,
        nodes,
        linkCount,
        simulation,
        getTransform: () => transform,
        setTransform: (t) => {
          transform = t;
        },
        draw: (hovered) =>
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
            hovered,
            fadeRadius,
          ),
      });

      simulation.on("tick", render);
    },

    destroy(): void {
      simulation?.stop();
      simulation = null;
    },
  };
}

registerContainer("global-graph", createGraphHandler);
