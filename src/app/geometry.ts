import { IPoint, IPose, IShape } from './components';
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

export interface IBoundary { minX: number; maxX: number; minY: number; maxY: number; }
export const fromShapeToBoundary = (shape: IShape): IBoundary => {
    const geojson = fromShapeToGeoJSON(shape);
    const bbox = turf.bbox(geojson);
    return {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
    };
};

export const getEuclideanDistanceBetweenPoints = (p1: IPoint, p2: IPoint): number => {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow(p2.y - p1.y, 2));
};
