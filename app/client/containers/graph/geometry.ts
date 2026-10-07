export interface Point {
  x: number;
  y: number;
}

export interface Transform extends Point {
  k: number;
}

interface WeightedShape {
  shape: Point[];
  weight: number;
}

const GEOMETRY_EPSILON = 1e-10;

function crossProduct(a: Point, b: Point): number {
  return a.x * b.y - a.y * b.x;
}

function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function turnDirection(a: Point, b: Point, c: Point): number {
  return crossProduct(subtract(b, a), subtract(c, b));
}

function buildHullHalf(points: Point[]): Point[] {
  const hull: Point[] = [];

  for (const point of points) {
    while (hull.length > 1) {
      const previous = hull[hull.length - 2];
      const last = hull[hull.length - 1];

      if (turnDirection(previous, last, point) > GEOMETRY_EPSILON) break;
      hull.pop();
    }

    hull.push(point);
  }

  return hull.slice(0, -1);
}

function convexHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const lower = buildHullHalf(sorted);
  const upper = buildHullHalf(sorted.reverse());

  return [...lower, ...upper];
}

function measurePolygon(shape: Point[]): { area: number; center: Point } {
  let doubledArea = 0;
  let weightedX = 0;
  let weightedY = 0;

  for (let i = 0; i < shape.length; i++) {
    const start = shape[i];
    const end = shape[(i + 1) % shape.length];
    const weight = crossProduct(start, end);

    doubledArea += weight;
    weightedX += (start.x + end.x) * weight;
    weightedY += (start.y + end.y) * weight;
  }

  return {
    area: doubledArea / 2,
    center: {
      x: weightedX / (3 * doubledArea),
      y: weightedY / (3 * doubledArea),
    },
  };
}

export function normalizeShape(points: Point[]): Point[] {
  const hull = convexHull(points);
  const { area, center } = measurePolygon(hull);
  const scale = Math.sqrt(Math.PI / area);

  return hull.map((point) => ({
    x: (point.x - center.x) * scale,
    y: (point.y - center.y) * scale,
  }));
}

export function createCircleShape(vertices: number): Point[] {
  const points = Array.from({ length: vertices }, (_, i) => {
    const angle = i * 2 * Math.PI / vertices;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  });

  return normalizeShape(points);
}

function addWeightedShape(points: Point[], shape: WeightedShape): Point[] {
  const sums = points.flatMap((point) =>
    shape.shape.map((vertex) => ({
      x: point.x + vertex.x * shape.weight,
      y: point.y + vertex.y * shape.weight,
    }))
  );

  return convexHull(sums);
}

export function blendShapes(shapes: WeightedShape[]): Point[] {
  let points: Point[] = [{ x: 0, y: 0 }];

  for (const shape of shapes) {
    if (shape.weight > 0) points = addWeightedShape(points, shape);
  }

  return normalizeShape(points);
}

export function containsPoint(
  shape: Point[],
  point: Point,
  padding = 0,
): boolean {
  return shape.every((start, i) => {
    const end = shape[(i + 1) % shape.length];
    const edge = subtract(end, start);
    const side = crossProduct(edge, subtract(point, start));
    const tolerance = padding * Math.hypot(edge.x, edge.y);

    return side >= -tolerance;
  });
}

function intersectRayWithEdge(
  direction: Point,
  start: Point,
  end: Point,
): number {
  const edge = subtract(end, start);
  const denominator = crossProduct(direction, edge);

  if (Math.abs(denominator) < GEOMETRY_EPSILON) return Infinity;

  const distance = crossProduct(start, edge) / denominator;
  const position = crossProduct(start, direction) / denominator;
  const onEdge = position >= -GEOMETRY_EPSILON &&
    position <= 1 + GEOMETRY_EPSILON;

  return distance >= 0 && onEdge ? distance : Infinity;
}

export function shapeBoundary(shape: Point[], direction: Point): number {
  let distance = Infinity;

  for (let i = 0; i < shape.length; i++) {
    const start = shape[i];
    const end = shape[(i + 1) % shape.length];
    const intersection = intersectRayWithEdge(direction, start, end);

    distance = Math.min(distance, intersection);
  }

  return Number.isFinite(distance) ? distance : 0;
}

export function screenToGraph(point: Point, transform: Transform): Point {
  return {
    x: (point.x - transform.x) / transform.k,
    y: (point.y - transform.y) / transform.k,
  };
}

export function zoomAt(
  transform: Transform,
  point: Point,
  factor: number,
): Transform {
  const zoom = Math.max(0.1, Math.min(4, transform.k * factor));
  const scale = zoom / transform.k;

  return {
    k: zoom,
    x: point.x - (point.x - transform.x) * scale,
    y: point.y - (point.y - transform.y) * scale,
  };
}
