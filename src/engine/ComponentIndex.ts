import Dictionary from '../framework/data-structures/Dictionary';
import IComponent from './interfaces/IComponent';
import IComponentIndex from './interfaces/IComponentIndex';
import IDictionary from '../framework/interfaces/IDictionary';
import IEntity from './interfaces/IEntity';
import { Ctor } from '../framework/types';

export default class ComponentIndex implements IComponentIndex {

    private __index: IDictionary<IDictionary<IEntity>>;

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

    public get(ComponentCtor: Ctor<IComponent<any>, any>): IDictionary<IEntity> {
        return this.__index.read(ComponentCtor.name);
    }

    public forEach(fn: (entity: IEntity) => void): void {
        this.__index.forEach((collection) => {
            collection.forEach((entity) => fn(entity));
        });
    }

    public forEvery<T extends IComponent<any>>(ComponentCtor: Ctor<T, any>): (fn: (entity: IEntity) => void) => void {
        const collection = this.__index.read(ComponentCtor.name);
        return collection ? collection.forEach.bind(collection) : function(): void { return; };
    }

}
