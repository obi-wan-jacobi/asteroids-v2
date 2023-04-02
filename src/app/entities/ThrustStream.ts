import { Entity } from '@plasmastrapi/ecs';
import { IPose, PoseComponent, ShapeComponent } from '@plasmastrapi/geometry';
import BooleanAsteroidSubtractorComponent from 'app/components/BooleanAsteroidSubtractorComponent';
import EphemeralComponent from 'app/components/EphemeralComponent';

export default class ThrustStream extends Entity {
  constructor({ pose, offset, width, length }: { pose: IPose; offset: { x: number }; width: number; length: number }) {
    super();
    this.$add(PoseComponent, pose);
    this.$add(ShapeComponent, {
      vertices: [
        { x: offset.x, y: -width / 2 },
        { x: -length * 0.7, y: -width * 2.5 },
        { x: -length * 1.2, y: -width * 1.2 },
        { x: -length * 1.2, y: width * 1.2 },
        { x: -length * 0.7, y: width * 2.5 },
        { x: offset.x, y: width / 2 },
      ],
    });
    this.$add(EphemeralComponent, { remainingMs: 1 });
    this.$add(BooleanAsteroidSubtractorComponent, {});
  }
}
