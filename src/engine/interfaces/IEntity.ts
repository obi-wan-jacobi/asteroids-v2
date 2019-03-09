import { IUnique } from '../../framework/data-structures/Container';
import IComponent from './IComponent';
import { Ctor } from '../../framework/types';

export default interface IEntity extends IUnique {

    add<T>(Component: Ctor<IComponent<T>, T>): (data: T) => void;

    remove<T>(Component: Ctor<IComponent<T>, T>): void;

    copy<T>(Component: Ctor<IComponent<T>, T>): T;

    mutate<T>(Component: Ctor<IComponent<T>, T>): (data: T) => void;

}
