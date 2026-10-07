import {
  containsPoint,
  type Point,
  screenToGraph,
  type Transform,
  zoomAt,
} from "./geometry.ts";
import { type GraphModel, type GraphNode, isFixedNode } from "./model.ts";

interface SimulationControl {
  alphaTarget(alpha: number): { restart(): void };
}

interface InteractionOptions {
  canvas: HTMLCanvasElement;
  graph: GraphModel;
  simulation: SimulationControl;
  getTransform(): Transform;
  setTransform(transform: Transform): void;
  draw(hoveredNode: GraphNode | null): void;
}

type Gesture =
  | { kind: "drag"; start: Point; node: GraphNode }
  | { kind: "click"; start: Point; node: GraphNode }
  | { kind: "pan"; start: Point; origin: Transform };

function pointerPosition(canvas: HTMLCanvasElement, event: MouseEvent): Point {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

export function hitTest(
  graph: GraphModel,
  screenPoint: Point,
  transform: Transform,
): GraphNode | null {
  const point = screenToGraph(screenPoint, transform);

  for (let i = graph.nodes.length - 1; i >= 0; i--) {
    const node = graph.nodes[i];
    const { shape, radius } = graph.profiles.get(node.id)!;
    const relative = {
      x: (point.x - (node.x ?? 0)) / radius,
      y: (point.y - (node.y ?? 0)) / radius,
    };
    const padding = 2 / (transform.k * radius);

    if (containsPoint(shape, relative, padding)) return node;
  }

  return null;
}

function hasMoved(start: Point, end: Point): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return dx * dx + dy * dy > 25;
}

function startDrag(node: GraphNode, simulation: SimulationControl): void {
  node.fx = node.x;
  node.fy = node.y;
  simulation.alphaTarget(0.3).restart();
}

function moveDrag(node: GraphNode, point: Point, transform: Transform): void {
  const position = screenToGraph(point, transform);

  node.fx = position.x;
  node.fy = position.y;
}

function releaseDrag(
  gesture: Gesture | null,
  simulation: SimulationControl,
): void {
  if (gesture?.kind !== "drag") return;

  simulation.alphaTarget(0.01);
  gesture.node.fx = null;
  gesture.node.fy = null;
}

function panTransform(
  gesture: Extract<Gesture, { kind: "pan" }>,
  point: Point,
  transform: Transform,
): Transform {
  return {
    ...transform,
    x: gesture.origin.x + point.x - gesture.start.x,
    y: gesture.origin.y + point.y - gesture.start.y,
  };
}

export function navigateTo(id: string): void {
  const link = document.createElement("a");

  link.href = `/${id}`;
  link.setAttribute("hx-get", `/swap/${id}`);
  link.setAttribute("hx-target", "#main");
  link.setAttribute("hx-push-url", `/${id}`);
  link.setAttribute("hx-swap", "show:window:top");
  link.setAttribute("hx-on:click", `select('${id}') && scrollToActive()`);

  document.body.appendChild(link);
  htmx.process(link);
  link.click();
  link.remove();
}

export function attachInteractionHandlers(
  options: InteractionOptions,
): { render(): void } {
  const { canvas, graph, simulation, getTransform, setTransform, draw } =
    options;
  let hoveredNode: GraphNode | null = null;
  let gesture: Gesture | null = null;
  let animationFrame: number | null = null;

  function render(): void {
    if (animationFrame !== null) return;

    animationFrame = requestAnimationFrame(() => {
      animationFrame = null;
      draw(hoveredNode);
    });
  }

  function updateCursor(): void {
    canvas.style.cursor = hoveredNode ? "pointer" : "default";
  }

  function nodeAt(point: Point): GraphNode | null {
    return hitTest(graph, point, getTransform());
  }

  function updateHover(point: Point): void {
    const node = nodeAt(point);
    if (node === hoveredNode) return;

    hoveredNode = node;
    updateCursor();
    render();
  }

  function beginGesture(event: MouseEvent): void {
    const point = pointerPosition(canvas, event);
    const node = nodeAt(point);
    hoveredNode = node;

    if (!node) {
      gesture = { kind: "pan", start: point, origin: getTransform() };
      canvas.style.cursor = "grabbing";
    } else if (isFixedNode(node)) {
      gesture = { kind: "click", start: point, node };
    } else {
      gesture = { kind: "drag", start: point, node };
      startDrag(node, simulation);
    }

    render();
  }

  function moveGesture(event: MouseEvent): void {
    const point = pointerPosition(canvas, event);

    if (gesture?.kind === "drag") {
      moveDrag(gesture.node, point, getTransform());
      render();
    } else if (gesture?.kind === "pan") {
      setTransform(panTransform(gesture, point, getTransform()));
      render();
    } else {
      updateHover(point);
    }
  }

  function finishGesture(event: MouseEvent): void {
    const point = pointerPosition(canvas, event);
    const clicked =
      gesture && gesture.kind !== "pan" && !hasMoved(gesture.start, point)
        ? gesture.node
        : null;

    releaseDrag(gesture, simulation);
    gesture = null;

    if (clicked) navigateTo(clicked.id);
    updateCursor();
  }

  function cancelGesture(): void {
    releaseDrag(gesture, simulation);
    gesture = null;
    hoveredNode = null;

    updateCursor();
    render();
  }

  function zoom(event: WheelEvent): void {
    event.preventDefault();

    const point = pointerPosition(canvas, event);
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    setTransform(zoomAt(getTransform(), point, factor));
    hoveredNode = nodeAt(point);

    updateCursor();
    render();
  }

  canvas.addEventListener("mousedown", beginGesture);
  canvas.addEventListener("mousemove", moveGesture);
  canvas.addEventListener("mouseup", finishGesture);
  canvas.addEventListener("mouseleave", cancelGesture);
  canvas.addEventListener("wheel", zoom, { passive: false });

  return { render };
}
