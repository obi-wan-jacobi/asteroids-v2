import { IPose, PoseComponent, ShapeComponent } from '@plasmastrapi/geometry';
import { AccelerationComponent, VelocityComponent } from '@plasmastrapi/physics';
import { COLOUR } from '@plasmastrapi/presentation';
import BaseEntity from 'app/abstracts/BaseEntity';
import ExplosionArea from './ExplosionArea';
import ExplosionVisual from './ExplosionVisual';
import ThrusterComponent from 'app/components/ThrusterComponent';
import { THRUSTER_STATE } from 'app/enums/THRUSTER_STATE';
import DestructibleHullComponent from 'app/components/DestructibleHullComponent';
import MissileLauncherComponent from 'app/components/MissileLauncherComponent';
import { MISSILE_LAUNCHER_STATE } from 'app/enums/MISSILE_LAUNCHER_STATE';

export default class Ship extends BaseEntity {
  constructor({ pose }: { pose: IPose }) {
    super({ pose });
    this.$add(ShapeComponent, {
      vertices: [
        { x: 20, y: 0 },
        { x: -10, y: -10 },
        { x: 0, y: 0 },
        { x: -10, y: 10 },
      ],
    });
    this.$add(VelocityComponent, { x: 0, y: 0, w: 0 });
    this.$add(AccelerationComponent, { x: 0, y: 0, w: 0 });
    this.$add(ThrusterComponent, {
      state: THRUSTER_STATE.IDLE,
      offset: { x: -10 },
      length: 60,
      width: 10,
      isCreateThrustStream: true,
    });
    this.$add(DestructibleHullComponent, {});
    this.$add(MissileLauncherComponent, { state: MISSILE_LAUNCHER_STATE.IDLE, cooldown: 200, timer: 200 });
  }

  public $destroy(): void {
    super.$destroy();
    const pose = this.$copy(PoseComponent)!;
    new ExplosionArea({ pose, radius: 200 });
    new ExplosionVisual({
      pose,
      radius: 200,
      spin: -Math.PI / 1024,
      colour: COLOUR.RGBA_YELLOW,
    });
    new ExplosionVisual({
      pose,
      radius: 198,
      spin: Math.PI / 1024,
      colour: COLOUR.RGBA_RED,
    });
  }
}
