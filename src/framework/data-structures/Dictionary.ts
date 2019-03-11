import IDictionary from '../interfaces/IDictionary';
import { Indexed } from '../types';

export default class Dictionary<T extends object> implements IDictionary<T> {

    private __data: Indexed<T>;

    constructor() {
        this.flush();
    }

    public get length(): number {
        return Object.keys(this.__data).length;
    }

    public read(key: string): T {
        return this.__data[key];
    }

    public write({ key, value }: { key: string, value: T }): void {
        this.__data[key] = value;
    }

    public delete(key: string): void {
        delete this.__data[key];
    }

    public flush(): void {
        this.__data = {} as T;
    }

    public forEach(fn: (value: T) => void): void {
        Object.keys(this.__data).forEach((key) => {
            if (this.__data[key]) {
                fn(this.__data[key]);
            }
        });
    }

}
