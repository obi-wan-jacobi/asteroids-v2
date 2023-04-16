import { IPose } from '@plasmastrapi/geometry';
import { VelocityComponent } from '@plasmastrapi/physics';
import BaseEntity from 'app/abstracts/BaseEntity';
import ExplosionArea from './ExplosionArea';
import ExplosionVisual from './ExplosionVisual';
import DestructibleHullComponent from 'app/components/DestructibleHullComponent';
import MissileLauncherComponent from 'app/components/MissileLauncherComponent';
import { MISSILE_LAUNCHER_STATE } from 'app/enums/MISSILE_LAUNCHER_STATE';
import EphemeralComponent from 'app/components/EphemeralComponent';
import { PoseComponent, ShapeComponent } from '@plasmastrapi/ecs';
import { COLOUR } from '@plasmastrapi/engine';

export default class AlienShip extends BaseEntity {
  constructor({ pose }: { pose: IPose }) {
    super({ pose });
    this.$add(ShapeComponent, {
      vertices: [
        { x: 40, y: 0 },
        { x: 25, y: -5 },
        { x: 10, y: -20 },
        { x: -10, y: -20 },
        { x: -25, y: -5 },
        { x: -40, y: 0 },
        { x: 0, y: 10 },
      ],
    });
    this.$add(VelocityComponent, { x: 0, y: 0, w: 0 });
    this.$add(DestructibleHullComponent, {});
    this.$add(MissileLauncherComponent, { state: MISSILE_LAUNCHER_STATE.IDLE, cooldown: 200, timer: 200 });
    this.$add(EphemeralComponent, { remainingMs: 10000 });
  }

  public $destroy(): void {
    super.$destroy();
    const pose = this.$copy(PoseComponent);
    new ExplosionArea({ pose, radius: 200 });
    new ExplosionVisual({
      pose,
      radius: 200,
      spin: (-Math.PI / 1024) * 1000,
      colour: COLOUR.RGBA_YELLOW,
    });
    new ExplosionVisual({
      pose,
      radius: 198,
      spin: (Math.PI / 1024) * 1000,
      colour: COLOUR.RGBA_RED,
    });
  }
}
