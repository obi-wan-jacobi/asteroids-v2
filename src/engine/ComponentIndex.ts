import Dictionary from '../framework/data-structures/Dictionary';
import IComponent from './interfaces/IComponent';
import IEntity from './interfaces/IEntity';
import { Ctor } from '../framework/types';

export interface IComponentIndex {
    add(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void;
    remove(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void;
    get(ComponentCtor: Ctor<IComponent<any>, any>): Dictionary<IEntity>;
    forEach(fn: (entity: IEntity) => void): void;
}
export default class ComponentIndex implements IComponentIndex {

    private __index: Dictionary<Dictionary<IEntity>>;

    constructor() {
        this.__index = new Dictionary();
    }

    public add(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void {
        return (instance: IEntity): void => {
            let collection = this.__index.read(ComponentCtor.name);
            if (!collection) {
                collection = new Dictionary();
                this.__index.write({
                    key: ComponentCtor.name,
                    value: collection,
                });
            }
            collection.write({
                key: instance.id,
                value: instance,
            });
        };
    }

    public remove(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void {
        return (instance: IEntity): void => {
            if (!this.__index.read(ComponentCtor.name)) {
                return;
            }
            this.__index.read(ComponentCtor.name).delete(instance.id);
        };
    }

    public get(ComponentCtor: Ctor<IComponent<any>, any>): Dictionary<IEntity> {
        return this.__index.read(ComponentCtor.name);
    }

    public forEach(fn: (entity: IEntity) => void): void {
        this.__index.forEach((collection) => {
            collection.forEach((entity) => fn(entity));
        });
    }

}
