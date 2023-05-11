import { IComponentMaster, IEntityMaster, PoseComponent, ShapeComponent, System } from '@plasmastrapi/ecs';
import { GeoJSON, Shape } from '@plasmastrapi/geometry';
import booleanOverlap from '@turf/boolean-overlap';
import DestructibleHullComponent from 'app/components/DestructibleHullComponent';
import Asteroid from 'app/entities/Asteroid';

export default class DestructibleHullSystem extends System {
  public once({ entities, components }: { entities: IEntityMaster; components: IComponentMaster }): void {
    components.forEvery(DestructibleHullComponent)((hull) => {
      entities.forEvery(Asteroid)((asteroid) => {
        const hullShape = Shape.transform(hull.$entity.$copy(ShapeComponent), hull.$entity.$copy(PoseComponent));
        const asteroidShape = Shape.transform(asteroid.$copy(ShapeComponent), asteroid.$copy(PoseComponent));
        const hullGeoJSON = GeoJSON.createFromShape(hullShape);
        const asteroidGeoJSON = GeoJSON.createFromShape(asteroidShape);
        if (booleanOverlap(hullGeoJSON, asteroidGeoJSON)) {
          return hull.$entity.$destroy();
        }
      });
    });
  }
}
