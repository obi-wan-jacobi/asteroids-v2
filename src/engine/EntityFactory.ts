import Dictionary from '../framework/data-structures/Dictionary';
import Factory from '../framework/data-structures/Factory';
import IComponent from './interfaces/IComponent';
import IComponentIndex from './interfaces/IComponentIndex';
import IDictionary from '../framework/interfaces/IDictionary';
import IEntity from './interfaces/IEntity';
import { IEntityFactory } from './interfaces/IEntityFactory';
import IFactory from '../framework/interfaces/IFactory';
import { Ctor, Optional } from '../framework/types';

export default class EntityFactory implements IEntityFactory {

    private __index: IDictionary<IFactory<IEntity>>;
    private __componentIndex: IComponentIndex;

    constructor(componentIndex: IComponentIndex) {
        this.__index = new Dictionary();
        this.__componentIndex = componentIndex;
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
        return container.add(EntityCtor, Object.assign({}, arg, { index: this.__componentIndex, factory: this })) as T;
    }

    public destroy(entity: IEntity): void {
        this.__index.read(entity.constructor.name).remove(entity);
        entity.forEach((component) => {
            this.__componentIndex.remove(component.constructor as Ctor<IComponent<any>, any>)(entity);
        });
    }

    public forEach(fn: (entity: IEntity) => void): void {
        this.__index.forEach((container) => {
            container.forEach((entity) => fn(entity));
        });
    }

}
