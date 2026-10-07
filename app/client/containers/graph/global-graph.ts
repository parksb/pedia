import {
  type ContainerHandler,
  loadScript,
  registerContainer,
} from "../../container.ts";
import { type Point, type Transform } from "./geometry.ts";
import { attachInteractionHandlers } from "./interaction.ts";
import {
  type CategoryWeights,
  createGraphModel,
  graphCategories,
  type GraphCategory,
  type GraphData,
  type GraphEdge,
  type GraphModel,
  type GraphNode,
  isFixedNode,
  ROOT_NODE,
} from "./model.ts";
import { createGraphRenderer, type GraphSize } from "./rendering.ts";

const D3_CDN = "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js";

function buildCategoryPositions(size: GraphSize): Map<GraphCategory, Point> {
  const categories = Object.keys(graphCategories) as GraphCategory[];
  const radius = Math.min(size.width, size.height) * 0.3;

  return new Map(categories.map((category, index) => {
    const angle = -Math.PI / 2 - (2 * Math.PI * index) / categories.length;

    return [category, {
      x: size.width / 2 + radius * Math.cos(angle),
      y: size.height / 2 + radius * Math.sin(angle),
    }];
  }));
}

function blendedPosition(
  weights: CategoryWeights,
  positions: Map<GraphCategory, Point>,
  center: Point,
): Point {
  const target = { x: 0, y: 0 };
  let hasCategory = false;

  for (const [category, position] of positions) {
    const weight = weights[category];

    target.x += position.x * weight;
    target.y += position.y * weight;
    hasCategory ||= weight > 0;
  }

  return hasCategory ? target : center;
}

function buildNodeTargets(
  graph: GraphModel,
  size: GraphSize,
): Map<string, Point> {
  const positions = buildCategoryPositions(size);
  const center = { x: size.width / 2, y: size.height / 2 };

  return new Map(graph.nodes.map((node) => {
    const { weights } = graph.profiles.get(node.id)!;
    return [node.id, blendedPosition(weights, positions, center)];
  }));
}

function initializeNodePositions(
  graph: GraphModel,
  targets: Map<string, Point>,
): void {
  for (const node of graph.nodes) {
    const target = targets.get(node.id)!;

    if (isFixedNode(node)) {
      node.x = target.x;
      node.y = target.y;
      node.fx = target.x;
      node.fy = target.y;
    } else {
      node.x = target.x + (Math.random() - 0.5) * 80;
      node.y = target.y + (Math.random() - 0.5) * 80;
    }
  }
}

function linkDistance(edge: GraphEdge): number {
  const touchesRoot = edge.source.id === ROOT_NODE ||
    edge.target.id === ROOT_NODE;
  return touchesRoot ? 300 : 100;
}

function createLinkForce(graph: GraphModel) {
  return d3
    .forceLink(graph.edges)
    .id((node: GraphNode) => node.id)
    .distance(linkDistance);
}

function createCollisionForce(graph: GraphModel) {
  return d3
    .forceCollide()
    .radius((node: GraphNode) => {
      const { radius, extent } = graph.profiles.get(node.id)!;
      return radius * extent * 0.85;
    })
    .strength(0.5);
}

function createSimulation(graph: GraphModel, targets: Map<string, Point>) {
  return d3
    .forceSimulation(graph.nodes)
    .alpha(0.3)
    .alphaDecay(0.03)
    .velocityDecay(0.6)
    .force("link", createLinkForce(graph))
    .force("charge", d3.forceManyBody().strength(-200))
    .force(
      "x",
      d3.forceX((node: GraphNode) => targets.get(node.id)!.x)
        .strength(0.3),
    )
    .force(
      "y",
      d3.forceY((node: GraphNode) => targets.get(node.id)!.y)
        .strength(0.3),
    )
    .force("collision", createCollisionForce(graph));
}

function initialTransform(size: GraphSize): Transform {
  const zoom = 0.6;

  return {
    x: size.width * (1 - zoom) / 2,
    y: size.height * (1 - zoom) / 2,
    k: zoom,
  };
}

async function loadGraph(): Promise<GraphModel> {
  await loadScript(D3_CDN);

  const response = await fetch("/api/graph");
  const data: GraphData = await response.json();

  return createGraphModel(data);
}

function createGraphHandler(): ContainerHandler {
  let simulation: ReturnType<typeof d3.forceSimulation> | null = null;
  let destroyed = false;

  function stopSimulation(): void {
    simulation?.stop();
    simulation = null;
  }

  function mountGraph(container: HTMLElement, graph: GraphModel): void {
    const renderer = createGraphRenderer(container, graph);
    const targets = buildNodeTargets(graph, renderer.size);
    let transform = initialTransform(renderer.size);

    initializeNodePositions(graph, targets);
    simulation = createSimulation(graph, targets);

    const { render } = attachInteractionHandlers({
      canvas: renderer.canvas,
      graph,
      simulation,
      getTransform: () => transform,
      setTransform: (next) => {
        transform = next;
      },
      draw: (hovered) => renderer.draw(transform, hovered),
    });

    simulation.on("tick", render);
  }

  return {
    async init(container: HTMLElement): Promise<void> {
      destroyed = false;
      stopSimulation();
      container.replaceChildren();

      const graph = await loadGraph();
      if (!destroyed) mountGraph(container, graph);
    },

    destroy(): void {
      destroyed = true;
      stopSimulation();
    },
  };
}

registerContainer("global-graph", createGraphHandler);
