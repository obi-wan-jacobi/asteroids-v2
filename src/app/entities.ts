import { Entity } from '../engine/Entity';
import { Ephemeral, Flair, IPoint, IPose, Pose, RigidBody, Shape, Steering, Thrust, Velocity } from './components';

export class Ship extends Entity {

    constructor() {
        super(arguments[0]);
        this.add(Shape)({ points: [
            { x: 20, y: 0 },
            { x: -10, y: -10 },
            { x: 0, y: 0 },
            { x: -10, y: 10 },
        ]});
        this.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0});
        this.add(Velocity)({ x: 0, y: 0, w: 0 });
        this.add(Steering)({ direction: 'NONE' });
        this.add(Thrust)({ state: 'IDLE', topSpeed: 10, increment: 0.02 });
    }

    public accelerate(): void {
        const thrust = this.copy(Thrust);
        thrust.state = 'ACCELERATE';
        this.mutate(Thrust)(thrust);
        this.add(Flair)({
            offset: { x: -10 },
            length: 60,
            width: 10,
        });
    }

    public idle(): void {
        const thrust = this.copy(Thrust);
        thrust.state = 'IDLE';
        this.mutate(Thrust)(thrust);
        this.remove(Flair);
    }

    public turnLeft(): void {
        this.mutate(Steering)({ direction: 'LEFT' });
    }

    public stopTurningLeft(): void {
        const steering = this.copy(Steering);
        if (steering.direction === 'LEFT') {
            this.mutate(Steering)({ direction: 'NONE' });
        }
    }

    public turnRight(): void {
        this.mutate(Steering)({ direction: 'RIGHT' });
    }

    public stopTurningRight(): void {
        const steering = this.copy(Steering);
        if (steering.direction === 'RIGHT') {
            this.mutate(Steering)({ direction: 'NONE' });
        }
    }

    public shoot(): void {
        this._factory.create(Missile, { pose: this.copy(Pose) });
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
            x: 5 * Math.cos(pose.a),
            y: 5 * Math.sin(pose.a),
            w: 0,
        });
        this.add(Ephemeral)({ remaining: 100 });
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
        this.add(RigidBody)({});
    }

    public destroy(): void {
        super.destroy();
        this._factory.create(Explosion, { pose: this.copy(Pose), radius: 40 });
    }

}

export class Explosion extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        const points: IPoint[] = [];
        [1, 2, 3, 4, 5, 6].forEach((vertex) => {
            points.push({
                x: radius * Math.cos(vertex * 2 * Math.PI / 6),
                y: radius * Math.sin(vertex * 2 * Math.PI / 6),
            });
        });
        this.add(Shape)( { points });
        this.add(Velocity)({ x: 0, y: 0, w: Math.PI / 32 });
        this.add(Ephemeral)({ remaining: 30 });
    }

}

export class Asteroid extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        const points: IPoint[] = [];
        [1, 2, 3, 4, 5, 6].forEach((vertex) => {
            points.push({
                x: radius * Math.cos(vertex * 2 * Math.PI / 6),
                y: radius * Math.sin(vertex * 2 * Math.PI / 6),
            });
        });
        this.add(Shape)( { points });
        this.add(Velocity)({ x: 0, y: 0, w: 0 });
        this.add(RigidBody)({});
    }

}
