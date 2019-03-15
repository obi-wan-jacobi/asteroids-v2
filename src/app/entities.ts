import { Entity } from '../engine/Entity';
import {
    Ephemeral, Flair, IPose, IShape, Pose, RigidBody, Shape, Steering, Thrust, Velocity,
} from './components';
import {
    fromGeoJSONCoordinatesToShapes, fromShapeToGeoJSONCoordinates, getMinMaxShapeBounds, transformShape,
} from './geometry';
const martinez = require('martinez-polygon-clipping');

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
        this._factory.create(Explosion, { pose: this.copy(Pose), radius: 50 });
    }

}

export class Explosion extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        this.add(Shape)({ points: [1, 2, 3, 4, 5, 6].map((vertex) => ({
            x: radius * Math.cos(vertex * 2 * Math.PI / 6),
            y: radius * Math.sin(vertex * 2 * Math.PI / 6),
        }))});
        this.add(Velocity)({ x: 0, y: 0, w: Math.PI / 32 });
        this.add(Ephemeral)({ remaining: 30 });
    }

}

export class Asteroid extends Entity {

    constructor({ pose, radius }: { pose: IPose, radius: number }) {
        super(arguments[0]);
        this.add(Pose)(pose);
        this.add(Shape)({ points: [1, 2, 3, 4, 5, 6].map((vertex) => ({
            x: radius * Math.cos(vertex * 2 * Math.PI / 6),
            y: radius * Math.sin(vertex * 2 * Math.PI / 6),
        }))});
        this.add(Velocity)({ x: 0, y: 0, w: 0 });
        this.add(RigidBody)({});
    }

    public diff({ pose, shape }: { pose: IPose, shape: IShape }): void {
        const myPose = this.copy(Pose);
        const incTransform = transformShape({ shape, pose });
        const incCoordinates = fromShapeToGeoJSONCoordinates(incTransform);
        const myTransform = transformShape({ shape: this.copy(Shape), pose: myPose });
        const myCoordinates = fromShapeToGeoJSONCoordinates(myTransform);
        const diff = martinez.diff(myCoordinates, incCoordinates);
        const diffShapes = fromGeoJSONCoordinatesToShapes(diff);
        this.destroy();
        if (diffShapes.length === 0) {
            return;
        }
        diffShapes.forEach((diffShape) => {
            const { x, y } = diffShape.points.reduce((prev, cur) => ({ x: prev.x + cur.x, y: prev.y + cur.y }));
            const fragPose = {
                x: x / diffShape.points.length,
                y: y / diffShape.points.length,
                a: 0,
            };
            const asteroid = this._factory.create(Asteroid, { pose: fragPose, radius: 0 });
            asteroid.mutate(Shape)({
                points: diffShape.points.map((point) => ({ x: point.x - fragPose.x, y: point.y - fragPose.y })),
            });
            const { minX, maxX, minY, maxY } = getMinMaxShapeBounds(asteroid.copy(Shape));
            const epsilon = 30;
            if (maxX - minX < epsilon && maxY - minY < epsilon) {
                asteroid.destroy();
            }
        });
    }

}
