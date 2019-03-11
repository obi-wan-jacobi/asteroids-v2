import { IMinMaxBoundary2D, IPoint, IPose, IShape } from './components';

export const rotatePointAboutOrigin = ({ point, orientation }: {
    point: IPoint, orientation: number,
}): IPoint => {
    const s = Math.sin(orientation);
    const c = Math.cos(orientation);
    return {
        x: point.x * c - point.y * s,
        y: point.x * s + point.y * c,
    };
};

export const rotatePointsAboutOrigin = ({ points, orientation }: {
    points: IPoint[], orientation: number,
}): IPoint[] => {
    return points.map((point) => {
        return rotatePointAboutOrigin({ point, orientation });
    });
};

export const transformShape = ({ shape, pose }: { shape: IShape, pose: IPose }): IShape => {
    const points = shape.points.map((point) => {
        return rotatePointAboutOrigin({ point, orientation: pose.a });
    });
    return translateShape({ shape: { points }, position: pose });
};

export const translateShape = ({ shape, position }: { shape: IShape, position: IPoint }): IShape => {
    const points = shape.points.map((point) => {
        return {
            x: point.x + position.x,
            y: point.y + position.y,
        };
    });
    return { points };
};

export const getMinMaxShapeBounds = (shape: IShape): IMinMaxBoundary2D => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    shape.points.forEach((point) => {
        if (point.x < minX) { minX = __settleFloatingPoint(point.x); }
        if (point.x > maxX) { maxX = __settleFloatingPoint(point.x); }
        if (point.y < minY) { minY = __settleFloatingPoint(point.y); }
        if (point.y > maxY) { maxY = __settleFloatingPoint(point.y); }
    });
    return { minX, maxX, minY, maxY };
};

export const isPointInsideMinMaxBounds = (point: IPoint, bounds: IMinMaxBoundary2D): boolean => {
    const { minX, maxX, minY, maxY } = bounds;
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

export const isPointInsideShape = (point: IPoint, shape: IShape): boolean => {
    const { minX, maxX, minY, maxY } = getMinMaxShapeBounds(shape);
    if (!isPointInsideMinMaxBounds(point, { minX, maxX, minY, maxY })) {
        return false;
    }
    let numberOfIntersections = 0;
    const shapeSegments = fromShapeToLineSegments(shape);
    const raySegment = { head: point, tail: { x: minX, y: minY } };
    for (const shapeSegment of shapeSegments) {
        const intersection = getPointOfIntersectionBetweenLinesFromSegments(raySegment, shapeSegment);
        if (isPointInsideMinMaxBounds(intersection, { minX, maxX, minY, maxY })) {
            if (Math.round(intersection.x) === Math.round(minX) && Math.round(intersection.y) === Math.round(minY)) {
                return true;
            } else {
                numberOfIntersections++;
            }
        }
    }
    return ((numberOfIntersections % 2) === 1)
        ? true
        : false;
};

export const fromPointsToStandardForm = ({ p1, p2 }: { p1: IPoint, p2: IPoint }): { m: number, b: number } => {
    const m = (p2.y - p1.y) / (p2.x - p1.x);
    const b = p1.y - m * p1.x;
    return { m, b };
};

export const getIntersectionBetweenStandardForms = (
    eq1: { m: number, b: number },
    eq2: { m: number, b: number },
): IPoint => {
    const intersectX = (eq2.b - eq1.b) / (eq1.m - eq2.m);
    const intersectY = eq1.m * intersectX + eq1.b;
    return {
        x: __settleFloatingPoint(intersectX),
        y: __settleFloatingPoint(intersectY),
    };
};

export const fromShapeToLineSegments = (shape: IShape): Array<{ head: IPoint, tail: IPoint }> => {
    const points = shape.points;
    points.push(points[0]);
    const segments = [];
    for (let i = 0, L = points.length; i < L - 1; i++) {
        segments.push({ head: points[i + 1], tail: points[i] });
    }
    return segments;
};

export const fromLineToLineSegments = ({ points }: { points: IPoint[] })
: Array<{ head: IPoint, tail: IPoint }> => {
    const segments = [];
    for (let i = 0, L = points.length; i < L - 1; i++) {
        segments.push({ head: points[i + 1], tail: points[i] });
    }
    return segments;
};

export const fromLineSegmentToStandardForm = (segment: { head: IPoint, tail: IPoint })
: { m: number, b: number } => {
    return fromPointsToStandardForm({ p1: segment.head, p2: segment.tail });
};

export const isShapeIntersectedByLine = (
    shape: IShape,
    line: { points: IPoint[] },
): boolean => {
    const segments = fromLineToLineSegments(line);
    for (const segment of segments) {
        if (isShapeIntersectedByLineSegment(shape, segment)) {
            return true;
        }
    }
    return false;
};

export const isShapeIntersectedByLineSegment = (
    shape: IShape,
    segment: { head: IPoint, tail: IPoint },
): boolean => {
    const shapeSegments = fromShapeToLineSegments(shape);
    for (const shapeSegment of shapeSegments) {
        if (isLineSegmentIntersectedByLineSegment(shapeSegment, segment)) {
            return true;
        }
    }
    return false;
};

export const isLineSegmentIntersectedByLineSegment = (
    segment1: { head: IPoint, tail: IPoint },
    segment2: { head: IPoint, tail: IPoint },
): boolean => {
    const intersection = getPointOfIntersectionBetweenLinesFromSegments(segment1, segment2);
    return isPointInsideMinMaxBounds(intersection, getMinMaxLineSegmentBounds(segment1))
        && isPointInsideMinMaxBounds(intersection, getMinMaxLineSegmentBounds(segment2)) ;
};

export const getPointOfIntersectionBetweenLinesFromSegments = (
    segment1: { head: IPoint, tail: IPoint },
    segment2: { head: IPoint, tail: IPoint },
): IPoint => {
    const ray = fromPointsToStandardForm({ p1: segment1.tail, p2: segment1.head });
    const { m, b } = fromPointsToStandardForm({ p1: segment2.tail, p2: segment2.head });
    if (!isFinite(ray.m)) {
        return {
            x: segment1.head.x,
            y: m * segment1.head.x + b,
        };
    } else if (!isFinite(m)) {
        return {
            x: segment2.head.x,
            y: ray.m * segment2.head.x + ray.b,
        };
    } else {
        return getIntersectionBetweenStandardForms(ray, { m, b });
    }
};

export const getMinMaxLineSegmentBounds = (segment: { head: IPoint, tail: IPoint }): IMinMaxBoundary2D => {
    return getMinMaxShapeBounds({ points: [segment.tail, segment.head] });
};

const __settleFloatingPoint = (value: number): number => {
    return (value * 1000) / 1000;
};
