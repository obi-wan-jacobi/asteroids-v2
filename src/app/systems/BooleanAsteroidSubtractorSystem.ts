import { IComponentMaster, IEntityMaster, PoseComponent, ShapeComponent, System } from '@plasmastrapi/ecs';
import {
  area,
  booleanContains,
  booleanOverlap,
  centerOfMass,
  difference,
  fromGeoJSONCoordinatesToShapes,
  fromShapeToBoundary,
  fromShapeToGeoJSON,
  geojson,
  IShape,
  kinks,
  simplify,
  transformShape,
  unkinkPolygon,
} from '@plasmastrapi/geometry';
import Asteroid from 'app/entities/Asteroid';
import BooleanAsteroidSubtractorComponent from 'app/components/BooleanAsteroidSubtractorComponent';

export class BooleanAsteroidSubtractorSystem extends System {
  public once({ entities, components }: { entities: IEntityMaster; components: IComponentMaster }): void {
    components.forEvery(BooleanAsteroidSubtractorComponent)((subtractor) => {
      entities.forEvery(Asteroid)((asteroid: Asteroid) => {
        const subtractorShape = transformShape(
          subtractor.$entity.$copy(ShapeComponent),
          subtractor.$entity.$copy(PoseComponent),
        );
        const asteroidShape = transformShape(asteroid.$copy(ShapeComponent), asteroid.$copy(PoseComponent));
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
    transformShape(asteroid.$copy(ShapeComponent), asteroid.$copy(PoseComponent)),
  );
  const diff = difference(asteroidGeoJSON, subtractorGeoJSON);
  if (!diff) {
    return asteroid.$destroy();
  }
  const simple = simplify(diff, { tolerance: 1, highQuality: false, mutate: true }) as geojson.Feature<
    geojson.Polygon,
    geojson.GeoJsonProperties
  >;
  let geojsons = [simple];
  if (kinks(simple).features.length) {
    geojsons = (unkinkPolygon(simple) as geojson.FeatureCollection).features as Array<
      geojson.Feature<geojson.Polygon, geojson.GeoJsonProperties>
    >;
  }
  const remainders = geojsons
    .map(fromGeoJSONCoordinatesToShapes)
    .flat()
    .filter((remainder) => {
      const { minX, maxX, minY, maxY } = fromShapeToBoundary(remainder);
      const epsilon = 30;
      return !(remainder.vertices.length < 3 || (maxX - minX < epsilon && maxY - minY < epsilon));
    })
    .sort((shape1, shape2) => {
      return area(fromShapeToGeoJSON(shape2)) - area(fromShapeToGeoJSON(shape1));
    });
  if (remainders.length === 0) {
    return asteroid.$destroy();
  }
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
  const geojson = fromShapeToGeoJSON(remainder);
  const result = centerOfMass(geojson);
  const [x, y] = result.geometry.coordinates;
  asteroid.$patch(ShapeComponent, {
    vertices: remainder.vertices.map((vertex) => ({
      x: vertex.x - x,
      y: vertex.y - y,
    })),
  });
  asteroid.$patch(PoseComponent, { x, y, a: 0 });
};
