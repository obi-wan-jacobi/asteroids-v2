import { IPoint, IPose } from '@plasmastrapi/geometry';
import { VelocityComponent } from '@plasmastrapi/physics';
import BaseEntity from '../abstracts/BaseEntity';
import { ShapeComponent } from '@plasmastrapi/ecs';

export default class Asteroid extends BaseEntity {
  constructor({
    pose,
    innerRadius,
    outerRadius,
    numberOfVertices,
  }: {
    pose: IPose;
    innerRadius: number;
    outerRadius: number;
    numberOfVertices: number;
  }) {
    super({ pose });
    const vertices: IPoint[] = [];
    for (let i = 1, L = numberOfVertices; i <= L; i++) {
      const r = innerRadius + outerRadius * Math.random();
      vertices.push({
        x: r * Math.cos((i * 2 * Math.PI) / numberOfVertices),
        y: r * Math.sin((i * 2 * Math.PI) / numberOfVertices),
      });
    }
    this.$add(ShapeComponent, { vertices });
    this.$add(VelocityComponent, {
      x: (0.05 - 0.1 * Math.random()) * 1000,
      y: (0.05 - 0.1 * Math.random()) * 1000,
      w: (Math.PI / 4096 - (Math.random() * Math.PI) / 2048) * 1000,
    });
  }
}
