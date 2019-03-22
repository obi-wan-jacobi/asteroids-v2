import { Entity } from '../engine/Entity';
import {
    Acceleration, BooleanAsteroidSubtractor, Ephemeral, Flair, Hull,
    IPoint, IPose, MissileLauncher, Pose, RenderingProfile, Shape, Thruster, Velocity,
} from './components';

export class Ship extends Entity {

    constructor({ pose }: { pose: IPose }) {
        super(arguments[0]);
        this.add(Shape)({ points: [
            { x: 20, y: 0 },
            { x: -10, y: -10 },
            { x: 0, y: 0 },
            { x: -10, y: 10 },
        ]});
        this.add(Pose)(pose);
        this.add(Velocity)({ x: 0, y: 0, w: 0 });
        this.add(Acceleration)({ x: 0, y: 0, w: 0 });
        this.add(Thruster)({ state: 'IDLE' });
        this.add(Hull)({});
        this.add(MissileLauncher)({ state: 'IDLE', cooldown: 200, timer: 200 });
        this.add(RenderingProfile)({ colour: 'white' });
    }

    public accelerate(): void {
        const factor = 0.0005;
        const pose = this.copy(Pose);
        const acceleration = this.copy(Acceleration);
        acceleration.x = factor * Math.cos(pose.a);
        acceleration.y = factor * Math.sin(pose.a);
        this.mutate(Acceleration)(acceleration);
        this.mutate(Thruster)({ state: 'ACCELERATE' });
        this.add(Flair)({
            offset: { x: -10 },
            length: 60,
            width: 10,
        });
    }

    public idle(): void {
        const acceleration = this.copy(Acceleration);
        acceleration.x = 0;
        acceleration.y = 0;
        this.mutate(Acceleration)(acceleration);
        this.mutate(Thruster)({ state: 'IDLE' });
        this.remove(Flair);
    }

    public turnLeft(): void {
        const velocity = this.copy(Velocity);
        velocity.w = -Math.PI / 512;
        this.mutate(Velocity)(velocity);
    }

    public stopTurningLeft(): void {
        const velocity = this.copy(Velocity);
        if (velocity.w < 0 ) {
            velocity.w = 0;
            this.mutate(Velocity)(velocity);
        }
    }

    public turnRight(): void {
        const velocity = this.copy(Velocity);
        velocity.w = Math.PI / 512;
        this.mutate(Velocity)(velocity);
    }

    public stopTurningRight(): void {
        const velocity = this.copy(Velocity);
        if (velocity.w > 0 ) {
            velocity.w = 0;
            this.mutate(Velocity)(velocity);
        }
    }

    public shoot(): void {
        const missileLauncher = this.copy(MissileLauncher);
        missileLauncher.state = 'FIRE';
        this.mutate(MissileLauncher)(missileLauncher);
    }

}

export class Missile extends Entity {

    constructor( { pose }: { pose: IPose }) {
        super(arguments[0]);
        this.add(Pose)({
            x: pose.x + 30 * Math.cos(pose.a),
            y: pose.y + 30 * Math.sin(pose.a),
            a: pose.a,
        });
        this.add(Velocity)({
            x: 1.0 * Math.cos(pose.a),
            y: 1.0 * Math.sin(pose.a),
            w: 0,
        });
        this.add(Hull)({});
        this.add(Ephemeral)({ remaining: 500 });
        this.add(Shape)({ points: [
            { x: 10, y: 0 },
            { x: -10, y: -2 },
            { x: -10, y: 2 },
        ]});
        this.add(Flair)({
            offset: { x: -10 },
            length: 40,
            width: 2,
        });
        this.add(RenderingProfile)({ colour: 'white' });
    }

    public destroy(): void {
        super.destroy();
        this.$.entities.create(MissileExplosion, { pose: this.copy(Pose), radius: 50 });
    }

}

export class MissileExplosion extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        this.add(Shape)({ points: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((vertex) => ({
            x: radius * Math.cos(vertex * 2 * Math.PI / 10),
            y: radius * Math.sin(vertex * 2 * Math.PI / 10),
        }))});
        this.add(Ephemeral)({ remaining: 1 });
        this.add(BooleanAsteroidSubtractor)({});
    }

    public destroy(): void {
        super.destroy();
        this.$.entities.create(MissileExplosionVisual, { pose: this.copy(Pose), radius: 50 });
    }

}

export class MissileExplosionVisual extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        this.add(Shape)({ points: [1, 2, 3, 4, 5, 6].map((vertex) => ({
            x: radius * Math.cos(vertex * 2 * Math.PI / 6),
            y: radius * Math.sin(vertex * 2 * Math.PI / 6),
        }))});
        this.add(Velocity)({ x: 0, y: 0, w: Math.PI / 1024 });
        this.add(Ephemeral)({ remaining: 300 });
        this.add(RenderingProfile)({ colour: 'yellow' });
        this.$.entities.create(MissileExplosionInnerVisual, { pose, radius: radius - 2 });
    }

}

export class MissileExplosionInnerVisual extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        this.add(Shape)({ points: [1, 2, 3, 4, 5, 6].map((vertex) => ({
            x: radius * Math.cos(vertex * 2 * Math.PI / 6),
            y: radius * Math.sin(vertex * 2 * Math.PI / 6),
        }))});
        this.add(Velocity)({ x: 0, y: 0, w: -Math.PI / 1024 });
        this.add(Ephemeral)({ remaining: 300 });
        this.add(RenderingProfile)({ colour: 'blue' });
    }

}

export class ThrustStream extends Entity {

    constructor({ pose, offset, width, length }:
        { pose: IPose, offset: { x: number }, width: number, length: number },
        ) {
            super(arguments[0]);
            this.add(Pose)(pose);
            this.add(Shape)({ points: [
                { x: offset.x, y: -width / 2 },
                { x: -length * 0.7, y: -width * 2.5 },
                { x: -length * 1.2, y: -width * 1.2 },
                { x: -length * 1.2, y: width * 1.2 },
                { x: -length * 0.7, y: width * 2.5 },
                { x: offset.x, y: width / 2 },
            ]});
            this.add(Ephemeral)({ remaining: 1 });
            this.add(BooleanAsteroidSubtractor)({});
        }

    }

export class Asteroid extends Entity {

    constructor({ pose, innerRadius, outerRadius, numberOfVertices }:
        { pose: IPose, innerRadius: number, outerRadius: number, numberOfVertices: number },
    ) {
        super(arguments[0]);
        this.add(Pose)(pose);
        const points: IPoint[] = [];
        for (let i = 1, L = numberOfVertices; i <= L; i++) {
            const r = innerRadius + outerRadius * Math.random();
            points.push({
                x: r * Math.cos(i * 2 * Math.PI / numberOfVertices),
                y: r * Math.sin(i * 2 * Math.PI / numberOfVertices),
            });
        }
        this.add(Shape)({ points });
        this.add(Velocity)({
            x: 0.05 - 0.1 * Math.random(),
            y: 0.05 - 0.1 * Math.random(),
            w: Math.PI / 4096 - Math.random() * Math.PI / 2048,
        });
        this.add(RenderingProfile)({ colour: 'white' });
    }

}
