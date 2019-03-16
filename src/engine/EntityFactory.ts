import Dictionary from '../framework/data-structures/Dictionary';
import Factory from '../framework/data-structures/Factory';
import IComponent from './interfaces/IComponent';
import IDictionary from '../framework/interfaces/IDictionary';
import IEngine from './interfaces/IEngine';
import IEntity from './interfaces/IEntity';
import { IEntityFactory } from './interfaces/IEntityFactory';
import IFactory from '../framework/interfaces/IFactory';
import { Ctor, Optional } from '../framework/types';

export default class EntityFactory implements IEntityFactory {

    public $: IEngine;

    private __index: IDictionary<IFactory<IEntity>>;

    constructor($: IEngine) {
        this.$ = $;
        this.__index = new Dictionary();
    }

    public create<T extends IEntity, TArg>(EntityCtor: Ctor<T, Optional<TArg>>, arg?: TArg): T {
        let container = this.__index.read(EntityCtor.name);
        if (!container) {
            container = new Factory();
            this.__index.write({
                key: EntityCtor.name,
                value: container,
            });
        }
        return container.add(EntityCtor, Object.assign({}, arg, { $: this.$ })) as T;
    }

    public destroy(entity: IEntity): void {
        this.__index.read(entity.constructor.name).remove(entity);
        entity.forEach((component) => {
            this.$.components.remove(component.constructor as Ctor<IComponent<any>, any>)(entity);
        });
    }

    public forEach(fn: (entity: IEntity) => void): void {
        this.__index.forEach((container) => {
            container.forEach((entity) => fn(entity));
        });
    }

    public forEvery<T extends IEntity>(EntityCtor: Ctor<T, any>): (fn: (entity: IEntity) => void) => void {
        const collection = this.__index.read(EntityCtor.name);
        return collection ? collection.forEach.bind(collection) : function(): void { return; };
    }

    public forEachWith<T extends IComponent<any>>(ComponentCtor: Ctor<T, any>):
        (fn: (entity: IEntity) => void) => void {
        return this.$.components.forEvery(ComponentCtor);
    }

}
