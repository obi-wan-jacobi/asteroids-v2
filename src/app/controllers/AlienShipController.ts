import { VelocityComponent } from '@plasmastrapi/physics';
import { MISSILE_LAUNCHER_STATE, MissileLauncherComponent } from '../components';
import { AlienShip } from '../entities';

export default class AlienShipController extends AlienShip {
  public engage(): void {
    this.__deek();
    this.__postpone(this.__loop, 100);
  }

  private __loop(): void {
    if (Math.random() >= 0.9) {
      this.__deek();
    }
    if (Math.random() >= 0.9) {
      this.__shoot();
    }
    this.__postpone(this.__loop, 100);
  }

  private __shoot(): void {
    this.$patch(MissileLauncherComponent, { state: MISSILE_LAUNCHER_STATE.FIRE });
  }

  private __deek(): void {
    this.$patch(VelocityComponent, { x: 0.4 * (0.5 - Math.random()), y: 0.4 * (0.5 - Math.random()), w: 0 });
  }

  private __postpone(next: () => void, ms: number): void {
    setTimeout(next.bind(this), ms);
  }
}
