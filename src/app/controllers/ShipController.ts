import { AccelerationComponent, VelocityComponent } from '@plasmastrapi/physics';
import { MISSILE_LAUNCHER_STATE, MissileLauncherComponent, THRUSTER_STATE, ThrusterComponent } from 'app/components';
import { Ship } from 'app/entities';
import IController from 'app/interfaces/IController';
import { app } from 'app/main';

export default class ShipController implements IController {
  private __ship: Ship;

  public init(): void {}

  public spawn(): void {
    this.__ship = new Ship({ pose: { x: 640, y: 360, a: -Math.PI / 2 } });
    app.entities.upkeep();
  }

  public accelerate(): void {
    this.__ship.$patch(ThrusterComponent, { state: THRUSTER_STATE.ACCELERATE });
  }

  public idle(): void {
    this.__ship.$patch(AccelerationComponent, { x: 0, y: 0, w: 0 });
    this.__ship.$patch(ThrusterComponent, { state: THRUSTER_STATE.IDLE });
  }

  public turnLeft(): void {
    this.__ship.$patch(VelocityComponent, { w: -Math.PI / 512 });
  }

  public stopTurningLeft(): void {
    const velocity = this.__ship.$copy(VelocityComponent)!;
    if (velocity.w < 0) {
      velocity.w = 0;
      this.__ship.$patch(VelocityComponent, velocity);
    }
  }

  public turnRight(): void {
    this.__ship.$patch(VelocityComponent, { w: Math.PI / 512 });
  }

  public stopTurningRight(): void {
    const velocity = this.__ship.$copy(VelocityComponent)!;
    if (velocity.w > 0) {
      velocity.w = 0;
      this.__ship.$patch(VelocityComponent, velocity);
    }
  }

  public shoot(): void {
    this.__ship.$patch(MissileLauncherComponent, { state: MISSILE_LAUNCHER_STATE.FIRE });
  }
}
