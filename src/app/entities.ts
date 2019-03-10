import { Entity } from '../engine/Entity';
import { IEntityFactory } from '../engine/interfaces/IEntityFactory';
import { Ephemeral, Flair, IPose, Pose, Shape, Steering, Thrust, Velocity } from './components';

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

    public turn(direction: string): void {
        this.mutate(Steering)({ direction });
    }

    public idle(): void {
        const thrust = this.copy(Thrust);
        thrust.state = 'IDLE';
        this.mutate(Thrust)(thrust);
        this.remove(Flair);
    }

    public spawnMissile(factory: IEntityFactory): void {
        factory.create(Missile, { pose: this.copy(Pose) });
    }

}

export class Missile extends Entity {

    constructor( { pose }: { pose: IPose }) {
        super(arguments[0]);
        this.add(Pose)({
            x: pose.x + 20 * Math.cos(pose.a),
            y: pose.y + 20 * Math.sin(pose.a),
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
    }

}

export class Asteroid extends Entity {}
