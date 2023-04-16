import { IComponentMaster, PoseComponent, System } from '@plasmastrapi/ecs';
import MissileLauncherComponent from 'app/components/MissileLauncherComponent';
import Missile from 'app/entities/Missile';
import { MISSILE_LAUNCHER_STATE } from 'app/enums/MISSILE_LAUNCHER_STATE';

export default class MissileLauncherSystem extends System {
  public once({ components, delta }: { components: IComponentMaster; delta: number }): void {
    components.forEvery(MissileLauncherComponent)((component) => {
      const launcher = component.copy();
      if (launcher.state === MISSILE_LAUNCHER_STATE.FIRE && launcher.timer >= launcher.cooldown) {
        new Missile({ pose: component.$entity.$copy(PoseComponent) });
        launcher.state = MISSILE_LAUNCHER_STATE.IDLE;
        launcher.timer = 0;
        return component.$entity.$patch(MissileLauncherComponent, launcher);
      }
      launcher.timer = launcher.timer < launcher.cooldown ? launcher.timer + delta : launcher.cooldown;
      return component.$entity.$patch(MissileLauncherComponent, launcher);
    });
  }
}
