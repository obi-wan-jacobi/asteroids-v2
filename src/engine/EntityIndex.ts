import { IComponentIndex } from './ComponentIndex';
import Container from '../framework/data-structures/Container';
import Dictionary from '../framework/data-structures/Dictionary';
import IEntity from './interfaces/IEntity';
import { Ctor, Optional } from '../framework/types';

export interface IEntityIndex {
    create<T extends IEntity, TArg>(EntityCtor: Ctor<T, Optional<TArg>>, arg?: TArg): T;
    destroy(entity: IEntity & { prototype: any }): void;
    forEach(fn: (entity: IEntity) => void): void;
}
export default class EntityIndex implements IEntityIndex {

    private __index: Dictionary<Container<IEntity>>;
    private __componentIndex: IComponentIndex;

    constructor(componentIndex: IComponentIndex) {
        this.__index = new Dictionary();
        this.__componentIndex = componentIndex;
    }

    public create<T extends IEntity, TArg>(EntityCtor: Ctor<T, Optional<TArg>>, arg?: TArg): T {
        let container = this.__index.read(EntityCtor.name);
        if (!container) {
            container = new Container();
            this.__index.write({
                key: EntityCtor.name,
                value: container,
            });
        }
        return container.add(EntityCtor, Object.assign({}, arg, { index: this.__componentIndex })) as T;
    }

    public destroy(entity: IEntity & { prototype: any }): void {
        this.__index.read(entity.prototype.constructor.name).remove(entity);
    }

    public forEach(fn: (entity: IEntity) => void): void {
        this.__index.forEach((container) => {
            container.forEach((entity) => fn(entity));
        });
    }

}
