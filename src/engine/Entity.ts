import IComponent from './interfaces/IComponent';
import IComponentIndex from './interfaces/IComponentIndex';
import IEntity from './interfaces/IEntity';
import { IEntityFactory } from './interfaces/IEntityFactory';
import Unique from '../framework/abstracts/Unique';
import { Ctor } from '../framework/types';

export class Entity extends Unique implements IEntity {

    protected _factory: IEntityFactory;

    private __data: { [key: string]: IComponent<any> } = {};
    private __index: IComponentIndex;

    constructor({ index, factory }: { index: IComponentIndex, factory: IEntityFactory }) {
        super();
        this.__index = index;
        this._factory = factory;
    }

    public destroy(): void {
        return this._factory.destroy(this);
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

    public forEach(fn: (component: IComponent<any>) => void): void {
        Object.keys(this.__data).forEach((key) => {
            fn(this.__data[key]);
        });
    }

}
