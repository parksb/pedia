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
  setupCanvas,
  type Transform,
} from "./utils.ts";

let allNodes: GraphNode[] | null = null;
let allEdges: GraphEdge[] | null = null;
let allAdjacency: Map<string, Set<string>> | null = null;
let nodeColors: Map<string, string> | null = null;
let currentDocId: string | null = null;

async function ensureGraphData(): Promise<void> {
  if (allNodes) return;
  await loadScript(D3_CDN);
  const { nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] } =
    await fetch("/api/graph").then((r) => r.json());

  allNodes = nodes;
  allEdges = edges;
  allAdjacency = buildAdjacency(edges);

  const categories = [...new Set(nodes.map((n) => n.category))];
  const categoryColor = d3.scaleOrdinal(d3.schemeObservable10).domain(
    categories,
  );
  nodeColors = buildNodeColors(nodes, edges, categoryColor);
}

function renderLocalGraph(
  container: HTMLElement,
  docId: string,
  // deno-lint-ignore no-explicit-any
): any {
  if (!allNodes || !allEdges || !allAdjacency || !nodeColors) return null;
  if (container.clientWidth === 0) return null;

  container.replaceChildren();

  const neighbors = allAdjacency.get(docId);
  const nodeSet = new Set([docId]);
  if (neighbors) {
    for (const n of neighbors) nodeSet.add(n);
  }

  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));
  const localNodes: GraphNode[] = [];
  for (const id of nodeSet) {
    const orig = nodeMap.get(id);
    if (orig) {
      localNodes.push({
        ...orig,
        x: undefined,
        y: undefined,
        fx: null,
        fy: null,
      });
    }
  }

  if (localNodes.length === 0) {
    localNodes.push({
      id: docId,
      label: docId,
      category: "",
      x: undefined,
      y: undefined,
      fx: null,
      fy: null,
    });
  }

  const localEdges: GraphEdge[] = allEdges
    .filter((e) => {
      const [s, t] = edgeEndpoints(e);
      return (s === docId || t === docId) && nodeSet.has(s) && nodeSet.has(t);
    })
    .map((e) => {
      const [s, t] = edgeEndpoints(e);
      return { source: s, target: t };
    });

  const localAdjacency = buildAdjacency(localEdges);
  const localLinkCount = buildLinkCount(localEdges);

  const w = container.clientWidth;
  const h = Math.min(w, 200);
  const { canvas, ctx } = setupCanvas(container, w, h);

  const cx = w / 2;
  const cy = h / 2;

  for (const node of localNodes) {
    if (node.id === docId) {
      node.x = cx;
      node.y = cy;
      node.fx = cx;
      node.fy = cy;
    } else {
      const i = localNodes.indexOf(node);
      const angle = (2 * Math.PI * (i - 1)) / (localNodes.length - 1 || 1);
      const r = Math.min(w, h) * 0.3;
      node.x = cx + r * Math.cos(angle);
      node.y = cy + r * Math.sin(angle);
    }
  }

  let transform: Transform = { x: 0, y: 0, k: 1 };
  const fadeRadius = 99999;

  const simulation = d3
    .forceSimulation(localNodes)
    .alpha(0.3)
    .alphaDecay(0.05)
    .velocityDecay(0.6)
    .force(
      "link",
      d3.forceLink(localEdges).id((d: GraphNode) => d.id).distance(
        Math.min(w, h) * 0.25,
      ),
    )
    .force("charge", d3.forceManyBody().strength(-300))
    .force("collision", d3.forceCollide().radius(16));

  const { render } = attachInteractionHandlers({
    canvas,
    nodes: localNodes,
    linkCount: localLinkCount,
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
        localNodes,
        localEdges,
        localLinkCount,
        nodeColors!,
        localAdjacency,
        transform,
        hovered,
        fadeRadius,
        1.5,
      ),
    shouldRelease: (node) => node.id !== docId,
  });

  simulation.on("tick", render);
  return simulation;
}

const activeHandlers = new Set<{
  update(docId: string): void;
}>();

export function updateLocalGraph(docId: string): void {
  currentDocId = docId;
  for (const handler of activeHandlers) {
    handler.update(docId);
  }
}

function createLocalGraphHandler(): ContainerHandler {
  // deno-lint-ignore no-explicit-any
  let simulation: any = null;
  let container: HTMLElement | null = null;
  let lastWidth = 0;
  let lastDocId: string | null = null;

  const handle = {
    update(docId: string, force = false) {
      if (!container) return;
      const w = container.clientWidth;
      if (w === 0) return;
      if (!force && w === lastWidth && docId === lastDocId) return;
      lastWidth = w;
      lastDocId = docId;
      simulation?.stop();
      simulation = renderLocalGraph(container, docId);
    },
  };

  const onResize = () => {
    if (currentDocId) handle.update(currentDocId);
  };

  return {
    async init(el: HTMLElement): Promise<void> {
      container = el;
      await ensureGraphData();

      globalThis.addEventListener("resize", onResize);
      activeHandlers.add(handle);

      const docId = currentDocId ??
        (globalThis.location.pathname.replace(/^\//, "") || "simonpedia");
      if (!currentDocId) currentDocId = docId;
      handle.update(docId);
    },

    destroy(): void {
      activeHandlers.delete(handle);
      globalThis.removeEventListener("resize", onResize);
      simulation?.stop();
      simulation = null;
      container = null;
      lastWidth = 0;
      lastDocId = null;
    },
  };
}

registerContainer("local-graph", createLocalGraphHandler);
