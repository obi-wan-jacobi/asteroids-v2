import { IMinMaxBoundary2D, IPoint, IPose, IShape } from './components';
import { Feature, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';
import turf from 'turf';

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
    return points.map((point) => rotatePointAboutOrigin({ point, orientation }));
};

export const transformShape = (shape: IShape, pose: IPose): IShape => {
    const points = shape.points.map((point) => rotatePointAboutOrigin({ point, orientation: pose.a }));
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

export const getMinMaxLineSegmentBounds = (segment: { head: IPoint, tail: IPoint }): IMinMaxBoundary2D => {
    return getMinMaxShapeBounds({ points: [segment.tail, segment.head] });
};

export const getEuclideanDistanceBetweenPoints = (p1: IPoint, p2: IPoint): number => {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow(p2.y - p1.y, 2));
};

export const fromShapeToGeoJSON = (shape: IShape): Feature<Polygon, GeoJsonProperties> => {
    return turf.polygon([
        shape.points.map((vertex) => [vertex.x, vertex.y ]).concat([[shape.points[0].x, shape.points[0].y]]),
    ]);
};

export const fromGeoJSONCoordinatesToShapes = (geoJSON: Feature<Polygon|MultiPolygon, GeoJsonProperties>): IShape[] => {
    if (!geoJSON) {
        return [];
    }
    if (geoJSON.geometry.type === 'Polygon') {
        return geoJSON.geometry.coordinates.map((points: number[][]) => {
            return { points: points.map((vertex: number[]) => ({ x: vertex[0], y: vertex[1] })) };
        });
    }
    if (geoJSON.geometry.type === 'MultiPolygon') {
        const shapes: IShape[] = [];
        geoJSON.geometry.coordinates.forEach((polygon) => {
            shapes.push(polygon.map((points: number[][]) => {
                return { points: points.map((vertex: number[]) => ({ x: vertex[0], y: vertex[1] })) };
            })[0]);
        });
        return shapes;
    }
    return [];
};

const __settleFloatingPoint = (value: number): number => {
    return (value * 1000) / 1000;
};
