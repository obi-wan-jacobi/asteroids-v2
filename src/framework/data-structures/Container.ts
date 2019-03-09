import Dictionary from './Dictionary';
import Wrapper from '../abstracts/Wrapper';
import { Ctor, Optional } from '../types';

export interface IUnique {
    id: string;
}

export default class Container<T extends IUnique> extends Wrapper<Dictionary<T>> {

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

    public forEach(method: (value: T) => void): void {
        this.unwrap().forEach(method);
    }

    public map(method: (value: T) => any): any[] {
        return this.unwrap().map(method);
    }

    public find(method: (value: T) => boolean): T {
        return this.unwrap().find(method);
    }

    public first(method?: (value: T) => void): Optional<T> {
        const first = this.unwrap().first();
        if (method && first) {
            method(first);
        }
        return first;
    }

}
