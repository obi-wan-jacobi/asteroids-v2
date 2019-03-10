import IDictionary from './IDictionary';
import IUnique from './IUnique';
import IWrapper from '../interfaces/IWrapper';
import { Ctor, Optional } from '../types';

export default interface IFactory<T extends IUnique> extends IWrapper<IDictionary<T>> {

    length: number;

    get(key: string): T;

    add<TData>(InstanceCtor: Ctor<T, Optional<TData>>, data?: TData): T;

    remove(instance: T): boolean;

    purge(): void;

    forEach(fn: (value: T) => void): void;

    map(fn: (value: T) => any): any[];

    find(fn: (value: T) => boolean): T;

    first(fn?: (value: T) => void): Optional<T>;

}
