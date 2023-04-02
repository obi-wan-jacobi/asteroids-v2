import { IComponentMaster, IEntityMaster, System } from '@plasmastrapi/ecs';
import { PoseComponent, ShapeComponent, fromShapeToGeoJSON, transformShape } from '@plasmastrapi/geometry';
import booleanOverlap from '@turf/boolean-overlap';
import { HullComponent } from 'app/components';
import { Asteroid } from 'app/entities';

export default class HullSystem extends System {
  public once({ entities, components }: { entities: IEntityMaster; components: IComponentMaster }): void {
    components.forEvery(HullComponent)((hull) => {
      entities.forEvery(Asteroid)((asteroid) => {
        const hullShape = transformShape(hull.$entity.$copy(ShapeComponent)!, hull.$entity.$copy(PoseComponent)!);
        const asteroidShape = transformShape(asteroid.$copy(ShapeComponent)!, asteroid.$copy(PoseComponent)!);
        const hullGeoJSON = fromShapeToGeoJSON(hullShape);
        const asteroidGeoJSON = fromShapeToGeoJSON(asteroidShape);
        if (booleanOverlap(hullGeoJSON, asteroidGeoJSON)) {
          return hull.$entity.$destroy();
        }
      });
    });
  }
}
