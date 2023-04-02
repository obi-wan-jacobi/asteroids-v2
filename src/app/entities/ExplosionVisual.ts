import { IPose, ShapeComponent } from '@plasmastrapi/geometry';
import { VelocityComponent } from '@plasmastrapi/physics';
import { COLOUR, StyleComponent } from '@plasmastrapi/presentation';
import BaseEntity from 'app/abstracts/BaseEntity';
import EphemeralComponent from 'app/components/EphemeralComponent';

export default class ExplosionVisual extends BaseEntity {
  constructor({ pose, radius, spin, colour }: { pose: IPose; radius: number; spin: number; colour: string }) {
    super({ pose });
    this.$add(ShapeComponent, {
      vertices: [1, 2, 3, 4, 5, 6].map((vertex) => ({
        x: radius * Math.cos((vertex * 2 * Math.PI) / 6),
        y: radius * Math.sin((vertex * 2 * Math.PI) / 6),
      })),
    });
    this.$add(VelocityComponent, { x: 0, y: 0, w: spin });
    this.$add(EphemeralComponent, { remainingMs: 300 });
    this.$patch(StyleComponent, {
      colour,
      fill: COLOUR.RGBA_0,
      opacity: 1,
      zIndex: 0,
    });
  }
}
