import { IPose, PoseComponent, ShapeComponent } from '@plasmastrapi/geometry';
import { VelocityComponent } from '@plasmastrapi/physics';
import { COLOUR } from '@plasmastrapi/presentation';
import BaseEntity from 'app/abstracts/BaseEntity';
import ExplosionArea from './ExplosionArea';
import ExplosionVisual from './ExplosionVisual';
import DestructibleHullComponent from 'app/components/DestructibleHullComponent';
import EphemeralComponent from 'app/components/EphemeralComponent';
import ThrusterComponent from 'app/components/ThrusterComponent';
import { THRUSTER_STATE } from 'app/enums/THRUSTER_STATE';

export default class Missile extends BaseEntity {
  constructor({ pose }: { pose: IPose }) {
    super({ pose });
    this.$patch(PoseComponent, {
      x: pose.x + 30 * Math.cos(pose.a),
      y: pose.y + 30 * Math.sin(pose.a),
      a: pose.a,
    });
    this.$add(VelocityComponent, {
      x: 1.0 * Math.cos(pose.a),
      y: 1.0 * Math.sin(pose.a),
      w: 0,
    });
    this.$add(DestructibleHullComponent, {});
    this.$add(EphemeralComponent, { remainingMs: 500 });
    this.$add(ShapeComponent, {
      vertices: [
        { x: 10, y: 0 },
        { x: -10, y: -2 },
        { x: -10, y: 2 },
      ],
    });
    this.$add(ThrusterComponent, {
      state: THRUSTER_STATE.ACCELERATE,
      offset: { x: -10 },
      length: 40,
      width: 2,
      isCreateThrustStream: false,
    });
  }

  public $destroy(): void {
    super.$destroy();
    const pose = this.$copy(PoseComponent)!;
    new ExplosionArea({ pose, radius: 50 });
    new ExplosionVisual({
      pose,
      radius: 50,
      spin: -Math.PI / 1024,
      colour: COLOUR.RGBA_YELLOW,
    });
    new ExplosionVisual({
      pose,
      radius: 48,
      spin: Math.PI / 1024,
      colour: COLOUR.RGBA_BLUE,
    });
  }
}
