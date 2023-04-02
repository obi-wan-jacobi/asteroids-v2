import { Entity } from '@plasmastrapi/ecs';
import { IPose, PoseComponent, ShapeComponent } from '@plasmastrapi/geometry';
import BooleanAsteroidSubtractorComponent from 'app/components/BooleanAsteroidSubtractorComponent';
import EphemeralComponent from 'app/components/EphemeralComponent';

export default class ExplosionArea extends Entity {
  constructor({ pose, radius }: { pose: IPose; radius: number }) {
    super();
    this.$add(PoseComponent, pose);
    this.$add(ShapeComponent, {
      vertices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vertex) => ({
        x: radius * Math.cos((vertex * 2 * Math.PI) / 10),
        y: radius * Math.sin((vertex * 2 * Math.PI) / 10),
      })),
    });
    this.$add(EphemeralComponent, { remainingMs: 1 });
    this.$add(BooleanAsteroidSubtractorComponent, {});
  }
}
