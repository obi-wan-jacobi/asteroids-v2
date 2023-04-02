import { IComponentMaster, System } from '@plasmastrapi/ecs';
import { EphemeralComponent } from 'app/components';

export default class EphemeralSystem extends System {
  public once({ components, delta }: { components: IComponentMaster; delta: number }): void {
    components.forEvery(EphemeralComponent)((component) => {
      let { remainingMs } = component.copy();
      remainingMs -= delta;
      component.patch({ remainingMs });
      if (remainingMs <= 0) {
        return component.$entity.$destroy();
      }
    });
  }
}
