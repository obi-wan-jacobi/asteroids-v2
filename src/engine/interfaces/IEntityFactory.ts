import IComponent from './IComponent';
import IEntity from './IEntity';
import { Ctor, Optional } from '../../framework/types';

export interface IEntityFactory {
    create<T extends IEntity, TArg>(EntityCtor: Ctor<T, Optional<TArg>>, arg?: TArg): T;
    destroy(entity: IEntity): void;
    forEach(fn: (entity: IEntity) => void): void;
    forEvery<T extends IEntity>(EntityCtor: Ctor<T, any>): (fn: (entity: IEntity) => void) => void;
    forEachWith<T extends IComponent<any>>(ComponentCtor: Ctor<T, any>): (fn: (entity: IEntity) => void) => void;
}
