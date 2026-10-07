import {
  blendShapes,
  createCircleShape,
  normalizeShape,
  type Point,
} from "./geometry.ts";

export const ROOT_NODE = "simonpedia";
export const graphCategories = {
  subject: "◇",
  publication: "□",
  idea: "△",
} as const;

export type GraphCategory = keyof typeof graphCategories;
export type CategoryWeights = Record<GraphCategory, number>;

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
  source: GraphNode;
  target: GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: { source: string; target: string }[];
}

interface ShapeProfile {
  shape: Point[];
  extent: number;
  rightEdge: number;
}

export interface NodeProfile extends ShapeProfile {
  weights: CategoryWeights;
  radius: number;
  minimumLabelZoom: number;
  mixtureLabel: string;
}

export interface GraphModel {
  nodes: GraphNode[];
  edges: GraphEdge[];
  adjacency: Map<string, Set<string>>;
  profiles: Map<string, NodeProfile>;
}

const categories = Object.keys(graphCategories) as GraphCategory[];
const neutralShape = createCircleShape(64);
const categoryShapes: Record<GraphCategory, Point[]> = {
  subject: normalizeShape([
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ]),
  publication: normalizeShape([
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ]),
  idea: normalizeShape([
    { x: 0, y: -1 },
    { x: Math.sqrt(3) / 2, y: 0.5 },
    { x: -Math.sqrt(3) / 2, y: 0.5 },
  ]),
};

function isGraphCategory(category: string): category is GraphCategory {
  return Object.hasOwn(graphCategories, category);
}

export function isCategoryAnchor(node: GraphNode): boolean {
  return node.id === node.category && isGraphCategory(node.category);
}

export function isFixedNode(node: GraphNode): boolean {
  return node.id === ROOT_NODE || isCategoryAnchor(node);
}

function addNeighbor(
  adjacency: Map<string, Set<string>>,
  source: string,
  target: string,
): void {
  let neighbors = adjacency.get(source);

  if (!neighbors) {
    neighbors = new Set();
    adjacency.set(source, neighbors);
  }

  neighbors.add(target);
}

function indexConnections(edges: GraphData["edges"]) {
  const adjacency = new Map<string, Set<string>>();
  const counts = new Map<string, number>();

  for (const { source, target } of edges) {
    addNeighbor(adjacency, source, target);
    addNeighbor(adjacency, target, source);

    counts.set(source, (counts.get(source) ?? 0) + 1);
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }

  return { adjacency, counts };
}

function normalizeWeights(weights: CategoryWeights): CategoryWeights {
  const total = categories.reduce(
    (sum, category) => sum + weights[category],
    0,
  );

  if (total > 0) {
    for (const category of categories) weights[category] /= total;
  }

  return weights;
}

function getCategoryWeights(
  node: GraphNode,
  nodes: Map<string, GraphNode>,
  neighbors: Set<string> | undefined,
): CategoryWeights {
  const weights: CategoryWeights = { subject: 0, publication: 0, idea: 0 };

  if (!isGraphCategory(node.category)) return weights;

  weights[node.category] = 3;

  if (!isCategoryAnchor(node)) {
    for (const neighbor of neighbors ?? []) {
      const category = nodes.get(neighbor)?.category;

      if (category && category !== node.category && isGraphCategory(category)) {
        weights[category] = 1;
      }
    }
  }

  return normalizeWeights(weights);
}

function createShapeProfile(weights: CategoryWeights): ShapeProfile {
  const shapes = categories.map((category) => ({
    shape: categoryShapes[category],
    weight: weights[category],
  }));
  const shape = shapes.some(({ weight }) => weight > 0)
    ? blendShapes(shapes)
    : neutralShape;

  return {
    shape,
    extent: Math.max(...shape.map((point) => Math.hypot(point.x, point.y))),
    rightEdge: Math.max(...shape.map((point) => point.x)),
  };
}

function getShapeProfile(
  weights: CategoryWeights,
  cache: Map<string, ShapeProfile>,
): ShapeProfile {
  const key = categories.map((category) => weights[category]).join(",");
  let profile = cache.get(key);

  if (!profile) {
    profile = createShapeProfile(weights);
    cache.set(key, profile);
  }

  return profile;
}

function minimumLabelZoom(connections: number): number {
  if (connections >= 12) return 0.6;
  if (connections >= 8) return 0.85;
  return 1.4;
}

function formatMixtureLabel(weights: CategoryWeights): string {
  const mixture = categories.filter((category) => weights[category] > 0);

  if (mixture.length < 2) return "";

  return mixture.map((category) => {
    const percentage = Math.round(weights[category] * 100);
    return `${graphCategories[category]} ${percentage}%`;
  }).join(" ");
}

function buildNodeProfiles(
  nodes: Map<string, GraphNode>,
  adjacency: Map<string, Set<string>>,
  counts: Map<string, number>,
): Map<string, NodeProfile> {
  const profiles = new Map<string, NodeProfile>();
  const shapeCache = new Map<string, ShapeProfile>();

  for (const node of nodes.values()) {
    const weights = getCategoryWeights(node, nodes, adjacency.get(node.id));
    const connections = counts.get(node.id) ?? 0;

    profiles.set(node.id, {
      ...getShapeProfile(weights, shapeCache),
      weights,
      radius: 3 + Math.log2(1 + connections) * 4,
      minimumLabelZoom: minimumLabelZoom(connections),
      mixtureLabel: formatMixtureLabel(weights),
    });
  }

  return profiles;
}

export function createGraphModel(data: GraphData): GraphModel {
  const nodesById = new Map(data.nodes.map((node) => [node.id, node]));
  const { adjacency, counts } = indexConnections(data.edges);
  const profiles = buildNodeProfiles(nodesById, adjacency, counts);
  const edges = data.edges.map(({ source, target }) => ({
    source: nodesById.get(source)!,
    target: nodesById.get(target)!,
  }));

  return { nodes: data.nodes, edges, adjacency, profiles };
}
