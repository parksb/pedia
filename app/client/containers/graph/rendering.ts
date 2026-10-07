import {
  type Point,
  screenToGraph,
  shapeBoundary,
  type Transform,
} from "./geometry.ts";
import {
  type GraphEdge,
  type GraphModel,
  type GraphNode,
  isFixedNode,
  type NodeProfile,
} from "./model.ts";

export interface GraphSize {
  width: number;
  height: number;
}

export interface GraphTheme {
  node: string;
  emphasis: string;
  edge: string;
  background: string;
  fontFamily: string;
}

export interface GraphView {
  size: GraphSize;
  transform: Transform;
  hoveredNode: GraphNode | null;
  fadeRadius: number;
}

interface DrawingFrame {
  context: CanvasRenderingContext2D;
  graph: GraphModel;
  theme: GraphTheme;
  view: GraphView;
  connected: Set<string> | null;
  pixel: number;
  center: Point;
}

function getGraphTheme(container: HTMLElement): GraphTheme {
  const style = getComputedStyle(container);
  const color = (name: string) => style.getPropertyValue(name).trim();

  return {
    node: color("--text-secondary"),
    emphasis: color("--text"),
    edge: color("--border"),
    background: color("--bg"),
    fontFamily: style.fontFamily,
  };
}

function setupCanvas(container: HTMLElement, size: GraphSize) {
  const pixelRatio = globalThis.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");

  canvas.width = size.width * pixelRatio;
  canvas.height = size.height * pixelRatio;
  canvas.style.width = `${size.width}px`;
  canvas.style.height = `${size.height}px`;
  canvas.style.display = "block";

  const context = canvas.getContext("2d")!;
  context.scale(pixelRatio, pixelRatio);
  container.appendChild(canvas);

  return { canvas, context };
}

function createDrawingFrame(
  context: CanvasRenderingContext2D,
  graph: GraphModel,
  theme: GraphTheme,
  view: GraphView,
): DrawingFrame {
  const { hoveredNode, size, transform } = view;
  const connected = hoveredNode
    ? new Set([hoveredNode.id, ...(graph.adjacency.get(hoveredNode.id) ?? [])])
    : null;
  const center = screenToGraph(
    { x: size.width / 2, y: size.height / 2 },
    transform,
  );

  return {
    context,
    graph,
    theme,
    view,
    connected,
    pixel: 1 / transform.k,
    center,
  };
}

function appendEdge(
  path: Path2D,
  edge: GraphEdge,
  sourceProfile: NodeProfile,
  targetProfile: NodeProfile,
): void {
  const { source, target } = edge;
  const dx = target.x! - source.x!;
  const dy = target.y! - source.y!;
  const distance = Math.hypot(dx, dy);

  if (!distance) return;

  const forward = { x: dx / distance, y: dy / distance };
  const backward = { x: -forward.x, y: -forward.y };
  const sourceRadius = sourceProfile.radius *
    shapeBoundary(sourceProfile.shape, forward);
  const targetRadius = targetProfile.radius *
    shapeBoundary(targetProfile.shape, backward);

  if (sourceRadius + targetRadius >= distance) return;

  path.moveTo(
    source.x! + forward.x * sourceRadius,
    source.y! + forward.y * sourceRadius,
  );
  path.lineTo(
    target.x! - forward.x * targetRadius,
    target.y! - forward.y * targetRadius,
  );
}

function drawEdges(frame: DrawingFrame): void {
  const { context, graph, theme, view, connected, pixel } = frame;
  const dimmed = new Path2D();
  const active = new Path2D();

  for (const edge of graph.edges) {
    const touchesHoveredNode = edge.source === view.hoveredNode ||
      edge.target === view.hoveredNode;
    const path = touchesHoveredNode ? active : dimmed;

    appendEdge(
      path,
      edge,
      graph.profiles.get(edge.source.id)!,
      graph.profiles.get(edge.target.id)!,
    );
  }

  context.lineWidth = pixel;
  context.strokeStyle = theme.edge;
  context.globalAlpha = connected ? 0.05 : 0.6;
  context.stroke(dimmed);

  if (connected) {
    context.strokeStyle = theme.node;
    context.globalAlpha = 0.8;
    context.stroke(active);
  }
}

function traceNode(
  context: CanvasRenderingContext2D,
  node: GraphNode,
  profile: NodeProfile,
): void {
  const { shape, radius } = profile;

  context.beginPath();
  context.moveTo(node.x! + shape[0].x * radius, node.y! + shape[0].y * radius);

  for (let i = 1; i < shape.length; i++) {
    const point = shape[i];
    context.lineTo(node.x! + point.x * radius, node.y! + point.y * radius);
  }

  context.closePath();
}

function drawNode(frame: DrawingFrame, node: GraphNode): void {
  const { context, graph, theme, view, connected, pixel } = frame;
  const hovered = node === view.hoveredNode;
  const focused = connected?.has(node.id) ?? false;

  context.globalAlpha = connected && !focused ? 0.1 : 1;
  traceNode(context, node, graph.profiles.get(node.id)!);

  if (focused) {
    context.fillStyle = hovered ? theme.emphasis : theme.edge;
    context.fill();
  }

  context.strokeStyle = hovered ? theme.emphasis : theme.node;
  context.lineWidth = (hovered ? 2 : 1.25) * pixel;
  context.stroke();
}

function drawNodes(frame: DrawingFrame): void {
  frame.context.lineJoin = "round";

  for (const node of frame.graph.nodes) drawNode(frame, node);
}

function shouldShowLabel(
  frame: DrawingFrame,
  node: GraphNode,
  profile: NodeProfile,
): boolean {
  if (isFixedNode(node)) return true;
  if (frame.connected) return frame.connected.has(node.id);

  return frame.view.transform.k >= profile.minimumLabelZoom;
}

function labelOpacity(frame: DrawingFrame, node: GraphNode): number {
  if (frame.connected) return frame.connected.has(node.id) ? 1 : 0.1;
  if (isFixedNode(node)) return 1;

  const distance = Math.hypot(
    node.x! - frame.center.x,
    node.y! - frame.center.y,
  );
  return Math.max(0, 1 - distance / (frame.view.fadeRadius * frame.pixel));
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  context.strokeText(text, x, y);
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function drawNodeLabel(frame: DrawingFrame, node: GraphNode): void {
  const { context, graph, theme, view, pixel } = frame;
  const profile = graph.profiles.get(node.id)!;

  if (!shouldShowLabel(frame, node, profile)) return;

  const opacity = labelOpacity(frame, node);
  if (opacity <= 0) return;

  const x = node.x! + profile.rightEdge * profile.radius + 6 * pixel;
  context.globalAlpha = opacity;
  drawText(context, node.label, x, node.y!, theme.emphasis);

  if (node === view.hoveredNode && profile.mixtureLabel) {
    drawText(
      context,
      profile.mixtureLabel,
      x,
      node.y! + 14 * pixel,
      theme.node,
    );
  }
}

function drawLabels(frame: DrawingFrame): void {
  const { context, theme, pixel } = frame;

  context.font = `${10 * pixel}px ${theme.fontFamily}`;
  context.textBaseline = "middle";
  context.lineWidth = 2 * pixel;
  context.lineJoin = "round";
  context.strokeStyle = theme.background;

  for (const node of frame.graph.nodes) drawNodeLabel(frame, node);
}

export function drawGraphFrame(
  context: CanvasRenderingContext2D,
  graph: GraphModel,
  theme: GraphTheme,
  view: GraphView,
): void {
  const frame = createDrawingFrame(context, graph, theme, view);
  const { size, transform } = view;

  context.clearRect(0, 0, size.width, size.height);
  context.save();
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);

  drawEdges(frame);
  drawNodes(frame);
  drawLabels(frame);

  context.restore();
  context.globalAlpha = 1;
}

export function createGraphRenderer(container: HTMLElement, graph: GraphModel) {
  const size = { width: container.clientWidth, height: container.clientHeight };
  const theme = getGraphTheme(container);
  const { canvas, context } = setupCanvas(container, size);
  const fadeRadius = Math.min(size.width, size.height) * 0.8;

  return {
    canvas,
    size,
    draw(transform: Transform, hoveredNode: GraphNode | null): void {
      drawGraphFrame(context, graph, theme, {
        size,
        transform,
        hoveredNode,
        fadeRadius,
      });
    },
  };
}
