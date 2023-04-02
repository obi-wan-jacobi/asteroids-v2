import { Entity } from '@plasmastrapi/ecs';
import { COLOUR, StyleComponent } from '@plasmastrapi/presentation';
import { IPoint, IPose, PoseComponent, ShapeComponent } from '@plasmastrapi/geometry';
import { VelocityComponent, AccelerationComponent } from '@plasmastrapi/physics';
import {
  BooleanAsteroidSubtractorComponent,
  EphemeralComponent,
  HullComponent,
  MISSILE_LAUNCHER_STATE,
  MissileLauncherComponent,
  THRUSTER_STATE,
  ThrusterComponent,
} from './components';
import { HTML5CanvasElement } from '@plasmastrapi/html5-canvas';

class BaseEntity extends HTML5CanvasElement {
  public constructor({ pose }: { pose: IPose }) {
    super();
    this.$patch(PoseComponent, pose);
  }
}

export class Ship extends BaseEntity {
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
    this.$add(HullComponent, {});
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

export class AlienShip extends BaseEntity {
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
    this.$add(HullComponent, {});
    this.$add(MissileLauncherComponent, { state: MISSILE_LAUNCHER_STATE.IDLE, cooldown: 200, timer: 200 });
    this.$add(EphemeralComponent, { remainingMs: 10000 });
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

export class Missile extends BaseEntity {
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
    this.$add(HullComponent, {});
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

export class ExplosionArea extends Entity {
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

export class ExplosionVisual extends BaseEntity {
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

export class ThrustStream extends Entity {
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

export class Asteroid extends BaseEntity {
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
      x: 0.05 - 0.1 * Math.random(),
      y: 0.05 - 0.1 * Math.random(),
      w: Math.PI / 4096 - (Math.random() * Math.PI) / 2048,
    });
  }
}
