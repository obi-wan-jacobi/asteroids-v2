import IComponent from './IComponent';
import IDictionary from '../../framework/interfaces/IDictionary';
import IEntity from './IEntity';
import { Ctor } from '../../framework/types';

export default interface IComponentIndex {
    add(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void;
    remove(ComponentCtor: Ctor<IComponent<any>, any>): (target: IEntity) => void;
    get(ComponentCtor: Ctor<IComponent<any>, any>): IDictionary<IEntity>;
    forEach(fn: (entity: IEntity) => void): void;
}
