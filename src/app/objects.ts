import { IComponentIndex } from '../engine/ComponentIndex';
import IComponent from '../engine/interfaces/IComponent';
import IEntity from '../engine/interfaces/IEntity';
import Unique from '../framework/abstracts/Unique';
import { Ctor } from '../framework/types';

export abstract class Component<T extends {}> implements IComponent<T> {

    private __data: T;

    constructor(data: T) {
        this.mutate(data);
    }

    public copy(): T {
        return this._clone(this.__data);
    }

    public mutate(data: T): void {
        this.__data = this._clone(data);
    }

    protected _clone(data: T): T {
        return JSON.parse(JSON.stringify(data));
    }

}

export interface IPoint { x: number; y: number; }
export class Point extends Component<IPoint> {}

export interface IPose { x: number; y: number; a: number; }
export class Pose extends Component<IPose> {}

export interface IShape { points: IPoint[]; }
export class Shape extends Component<IShape> {}

export interface IMinMaxBoundary2D {
    minX: number; maxX: number; minY: number; maxY: number;
}
export class MinMaxBoundary2D extends Component<IMinMaxBoundary2D> {}

export class ShapeBuilder {

    public static rectangle({ width, height }: { width: number, height: number }): IShape {
        return {
            points: [
                { x: width / 2, y: - height / 2 },
                { x: - width / 2, y: - height / 2 },
                { x: - width / 2, y: height / 2 },
                { x: width / 2, y: height / 2 },
            ],
        };
    }

}

export interface IVelocity { x: number; y: number; w: number; }
export class Velocity extends Component<IVelocity> {}

export interface IAcceleration { x: number; y: number; w: number; }
export class Acceleration extends Component<IAcceleration> {}

export class Entity extends Unique implements IEntity {

    private __data: { [key: string]: IComponent<any> } = {};
    private __index: IComponentIndex;

    constructor({ index }: { index: IComponentIndex }) {
        super();
        this.__index = index;
    }

    public add<T>(ComponentCtor: Ctor<IComponent<T>, T>): (data: T) => void {
        return (data: T) => {
            if (!this.__data[ComponentCtor.name]) {
                this.__data[ComponentCtor.name] = new ComponentCtor(data);
                this.__index.add(ComponentCtor)(this);
            }
            return this.mutate(ComponentCtor)(data);
        };
    }

    public remove<T>(ComponentCtor: Ctor<IComponent<T>, T>): void {
        delete this.__data[ComponentCtor.name];
        this.__index.remove(ComponentCtor)(this);
    }

    public copy<T>(ComponentCtor: Ctor<IComponent<T>, T>): T {
        return (this.__data[ComponentCtor.name])
            ? this.__data[ComponentCtor.name].copy()
            : undefined;
    }

    public mutate<T>(ComponentCtor: Ctor<IComponent<T>, T>): (data: T) => void {
        return (data: T) => {
            this.__data[ComponentCtor.name].mutate(data);
        };
    }

}
