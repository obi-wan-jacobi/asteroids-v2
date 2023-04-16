import { IComponentMaster, IEntityMaster, PoseComponent, ShapeComponent, System } from '@plasmastrapi/ecs';
import { fromShapeToGeoJSON, transformShape } from '@plasmastrapi/geometry';
import booleanOverlap from '@turf/boolean-overlap';
import DestructibleHullComponent from 'app/components/DestructibleHullComponent';
import Asteroid from 'app/entities/Asteroid';

export default class DestructibleHullSystem extends System {
  public once({ entities, components }: { entities: IEntityMaster; components: IComponentMaster }): void {
    components.forEvery(DestructibleHullComponent)((hull) => {
      entities.forEvery(Asteroid)((asteroid) => {
        const hullShape = transformShape(hull.$entity.$copy(ShapeComponent), hull.$entity.$copy(PoseComponent));
        const asteroidShape = transformShape(asteroid.$copy(ShapeComponent), asteroid.$copy(PoseComponent));
        const hullGeoJSON = fromShapeToGeoJSON(hullShape);
        const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
        if (booleanOverlap(hullGeoJSON, asteroidGeoJSON)) {
          return hull.$entity.$destroy();
        }
      });
    });
  }
}
