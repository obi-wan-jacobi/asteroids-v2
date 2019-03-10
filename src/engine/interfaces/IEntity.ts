import IComponent from './IComponent';
import IUnique from '../../framework/interfaces/IUnique';
import { Ctor } from '../../framework/types';

export default interface IEntity extends IUnique {

    destroy(): void;

    add<T>(ComponentCtor: Ctor<IComponent<T>, T>): (data: T) => void;

    remove<T>(ComponentCtor: Ctor<IComponent<T>, T>): void;

    copy<T>(ComponentCtor: Ctor<IComponent<T>, T>): T;

    mutate<T>(ComponentCtor: Ctor<IComponent<T>, T>): (data: T) => void;

    forEach(fn: (component: IComponent<any>) => void): void;

}
