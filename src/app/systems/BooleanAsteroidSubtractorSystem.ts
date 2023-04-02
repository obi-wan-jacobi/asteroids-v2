import unkinkPolygon from '@turf/unkink-polygon';
import { BooleanAsteroidSubtractorComponent } from '../components';
import { Asteroid } from '../entities';
import { Feature, FeatureCollection, GeoJsonProperties, Polygon } from 'geojson';
import difference from '@turf/difference';
import simplify from '@turf/simplify';
import kinks from '@turf/kinks';
import area from '@turf/area';
import { IComponentMaster, IEntityMaster, System } from '@plasmastrapi/ecs';
import {
  fromGeoJSONCoordinatesToShapes,
  fromShapeToBoundary,
  fromShapeToGeoJSON,
  IShape,
  PoseComponent,
  ShapeComponent,
  transformShape,
} from '@plasmastrapi/geometry';
const booleanOverlap = require('@turf/boolean-overlap').default;
const booleanContains = require('@turf/boolean-contains').default;
const centerOfMass = require('@turf/center-of-mass').default;

export class BooleanAsteroidSubtractorSystem extends System {
  public once({ entities, components }: { entities: IEntityMaster; components: IComponentMaster }): void {
    components.forEvery(BooleanAsteroidSubtractorComponent)((subtractor) => {
      entities.forEvery(Asteroid)((asteroid: Asteroid) => {
        const subtractorShape = transformShape(
          subtractor.$entity.$copy(ShapeComponent)!,
          subtractor.$entity.$copy(PoseComponent)!,
        );
        const asteroidShape = transformShape(asteroid.$copy(ShapeComponent)!, asteroid.$copy(PoseComponent)!);
        const subtractorGeoJSON = fromShapeToGeoJSON(subtractorShape);
        const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
        if (booleanOverlap(subtractorGeoJSON, asteroidGeoJSON) || booleanContains(subtractorGeoJSON, asteroidGeoJSON)) {
          return diffAsteroid(subtractorShape, asteroid);
        }
      });
    });
  }
}

const diffAsteroid = (subtractorShape: IShape, asteroid: Asteroid): void => {
  const subtractorGeoJSON = fromShapeToGeoJSON(subtractorShape);
  const asteroidGeoJSON = fromShapeToGeoJSON(
    transformShape(asteroid.$copy(ShapeComponent)!, asteroid.$copy(PoseComponent)!),
  );
  const diff = difference(asteroidGeoJSON, subtractorGeoJSON);
  if (!diff) {
    return asteroid.$destroy();
  }
  const simple = simplify(diff, { tolerance: 1, highQuality: false, mutate: true }) as Feature<
    Polygon,
    GeoJsonProperties
  >;
  if (!simple) {
    return asteroid.$destroy();
  }
  let geojsons = [simple];
  if (kinks(simple).features.length) {
    geojsons = (unkinkPolygon(simple) as FeatureCollection).features as Array<Feature<Polygon, GeoJsonProperties>>;
  }
  const remainders = geojsons
    .map(fromGeoJSONCoordinatesToShapes)
    .flatMap((shapes) => shapes)
    .sort((shape1, shape2) => {
      return area(fromShapeToGeoJSON(shape2)) - area(fromShapeToGeoJSON(shape1));
    });
  transformAsteroidFragment(asteroid, remainders.shift()!);
  remainders.forEach((remainder) => {
    const fragment = new Asteroid({
      pose: { x: 0, y: 0, a: 0 },
      innerRadius: 0,
      outerRadius: 0,
      numberOfVertices: 0,
    });
    transformAsteroidFragment(fragment, remainder);
  });
};

const transformAsteroidFragment = (asteroid: Asteroid, remainder: IShape): void => {
  const { minX, maxX, minY, maxY } = fromShapeToBoundary(remainder);
  const epsilon = 30;
  if (remainder.vertices.length < 3 || (maxX - minX < epsilon && maxY - minY < epsilon)) {
    return asteroid.$destroy();
  }
  const geojson = fromShapeToGeoJSON(remainder);
  const result = centerOfMass(geojson);
  const [x, y] = result.geometry.coordinates;
  const shape = asteroid.$get(ShapeComponent)!;
  shape.mutate({
    vertices: remainder.vertices.map((vertex) => ({
      x: vertex.x - x,
      y: vertex.y - y,
    })),
  });
  asteroid.$patch(PoseComponent, { x, y, a: 0 });
};