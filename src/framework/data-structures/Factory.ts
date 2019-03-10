import Dictionary from './Dictionary';
import IFactory from '../interfaces/IFactory';
import IUnique from '../interfaces/IUnique';
import Wrapper from '../abstracts/Wrapper';
import { Ctor, Optional } from '../types';

export default class Factory<T extends IUnique> extends Wrapper<Dictionary<T>> implements IFactory<T> {

    constructor() {
        super(new Dictionary<T>());
    }

    public get length(): number {
        return this.unwrap().length;
    }

    public get(key: string): T {
        return this.unwrap().read(key);
    }

    public add<TData>(InstanceCtor: Ctor<T, Optional<TData>>, data?: TData): T {
        const instance = new InstanceCtor(data);
        this.unwrap().write({
            key: instance.id,
            value: instance,
        });
        return instance;
    }

    public remove(instance: T): boolean {
        if (!this.unwrap().read(instance.id)) {
            return false;
        }
        this.unwrap().delete(instance.id);
        return true;
    }

    public purge(): void {
        this.unwrap().flush();
    }

    public forEach(fn: (value: T) => void): void {
        this.unwrap().forEach(fn);
    }

    public map(fn: (value: T) => any): any[] {
        return this.unwrap().map(fn);
    }

    public find(fn: (value: T) => boolean): T {
        return this.unwrap().find(fn);
    }

    public first(fn?: (value: T) => void): Optional<T> {
        const first = this.unwrap().first();
        if (fn && first) {
            fn(first);
        }
        return first;
    }

}
