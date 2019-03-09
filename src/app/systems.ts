import { IUnique } from '../framework/data-structures/Container';
import IComponent from '../engine/interfaces/IComponent';
import IEntity from '../engine/interfaces/IEntity';
import Unique from '../framework/abstracts/Unique';
import { Acceleration, Pose, Velocity } from './objects';

export function OnlyIfEntityHas<T>(Component: new (data: T) => IComponent<T>): any {
    return (target: System, key: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        descriptor.value = function(entity: IEntity): void {
            if (!entity.copy(Component)) {
                return;
            }
            method(entity);
        };
    };
}

export interface ISystem extends IUnique {

    once(entity: IEntity): void;

}

export abstract class System extends Unique implements ISystem {

    public abstract once(entity: IEntity): void;

}

export class AccelerationSystem extends System {

    @OnlyIfEntityHas(Velocity)
    @OnlyIfEntityHas(Acceleration)
    public once(entity: IEntity): void {
        const velocity = entity.copy(Velocity);
        const acceleration = entity.copy(Acceleration);
        entity.mutate(Velocity)({
            x: velocity.x + acceleration.x,
            y: velocity.y + acceleration.y,
            w: velocity.w + acceleration.w,
        });
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
            y = this.__boundary.maxX;
        }
        if (y > this.__boundary.maxY) {
            y = this.__boundary.minY;
        }
        a = a;
        entity.mutate(Pose)({ x, y, a });
    }
}
