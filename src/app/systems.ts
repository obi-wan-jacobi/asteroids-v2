import IEntity from '../engine/interfaces/IEntity';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';
import { OnlyIfEntityHas, System } from '../engine/abstracts/System';
import { Ephemeral, Flair, Label, Pose, Shape, Steering, Thrust, Velocity } from './components';
import { transformShape } from './geometry';

export class EphemeralSystem extends System {

    @OnlyIfEntityHas(Ephemeral)
    public once(entity: IEntity): void {
        const { remaining } = entity.copy(Ephemeral);
        if (remaining === 1) {
            return entity.destroy();
        }
        entity.mutate(Ephemeral)({
            remaining: remaining - 1,
        });
    }

}

export class ThrustSystem extends System {

    @OnlyIfEntityHas(Thrust)
    public once(entity: IEntity): void {
        const pose = entity.copy(Pose);
        const thrust = entity.copy(Thrust);
        const velocity = entity.copy(Velocity);
        if (thrust.state === 'ACCELERATE') {
            entity.mutate(Thrust)(thrust);
            entity.mutate(Velocity)({
                x: velocity.x + thrust.increment * Math.cos(pose.a),
                y: velocity.y + thrust.increment * Math.sin(pose.a),
                w: velocity.w,
            });
        }
    }

}

export class VelocitySystem extends System {

    @OnlyIfEntityHas(Pose)
    @OnlyIfEntityHas(Velocity)
    public once(entity: IEntity): void {
        const pose = entity.copy(Pose);
        const velocity = entity.copy(Velocity);
        entity.mutate(Pose)({
            x: pose.x + velocity.x,
            y: pose.y + velocity.y,
            a: pose.a + velocity.w,
        });
    }

}

export class BoundarySytem extends System {

    private __boundary = {
        minX: 0, minY: 0, maxX: 1280, maxY: 680,
    };

    @OnlyIfEntityHas(Pose)
    public once(entity: IEntity): void {
        let { x, y, a } = entity.copy(Pose);
        if (x < this.__boundary.minX) {
            x = this.__boundary.maxX;
        }
        if (x > this.__boundary.maxX) {
            x = this.__boundary.minX;
        }
        if (y < this.__boundary.minY) {
            y = this.__boundary.maxY;
        }
        if (y > this.__boundary.maxY) {
            y = this.__boundary.minY;
        }
        a = a;
        entity.mutate(Pose)({ x, y, a });
    }
}

export class SteeringSystem extends System {

    @OnlyIfEntityHas(Steering)
    public once(entity: IEntity): void {
        const steering = entity.copy(Steering);
        if (steering.direction === 'LEFT') {
            return turnLeft(entity);
        }
        if (steering.direction === 'RIGHT') {
            return turnRight(entity);
        }
    }

}

const turnLeft = (ship: IEntity): void => {
    const pose = ship.copy(Pose);
    pose.a += - Math.PI / 48;
    ship.mutate(Pose)(pose);
};
const turnRight = (ship: IEntity): void => {
    const pose = ship.copy(Pose);
    pose.a += Math.PI / 48;
    ship.mutate(Pose)(pose);
};

export abstract class DrawSystem extends System {

    protected _viewport: IViewportAdaptor;

    constructor({ viewport }: { viewport: IViewportAdaptor }) {
        super();
        this._viewport = viewport;
    }

}

export class ShapeSystem extends DrawSystem {

    constructor({ viewport }: { viewport: IViewportAdaptor }) {
        super({ viewport });
    }

    @OnlyIfEntityHas(Shape)
    public once(entity: IEntity): void {
        const transform = transformShape({ shape: entity.copy(Shape), pose: entity.copy(Pose) });
        this._viewport.drawShape(transform);
    }
}

export class LabelSystem extends DrawSystem {

    constructor({ viewport }: { viewport: IViewportAdaptor }) {
        super({ viewport });
    }

    @OnlyIfEntityHas(Label)
    public once(entity: IEntity): void {
        this._viewport.drawLabel({
            pose: entity.copy(Pose),
            label: entity.copy(Label),
        });
    }
}

export class FlairSystem extends DrawSystem {

    constructor({ viewport }: { viewport: IViewportAdaptor }) {
        super({ viewport });
    }

    @OnlyIfEntityHas(Flair)
    public once(entity: IEntity): void {
        const pose = entity.copy(Pose);
        const flair = entity.copy(Flair);
        const shape = { points: [
            { x: flair.offset.x, y: - flair.width / 2 },
            { x: - flair.length, y: 0 },
            { x: flair.offset.x, y: flair.width / 2 },
        ]};
        const transform = transformShape({ shape, pose });
        this._viewport.drawLine({
            points: transform.points,
            rendering: { colour: 'red' },
        });
    }

}
