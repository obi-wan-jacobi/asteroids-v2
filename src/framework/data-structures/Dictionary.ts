import { Indexed, Optional } from '../types';

export default class Dictionary<T> {

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
            fn(this.__data[key]);
        });
    }

    public map(fn: (value: T) => any): any[] {
        return Object.keys(this.__data).map((key) => {
            return fn(this.__data[key]);
        });
    }

    public find(fn: (value: T) => boolean): T {
        return this.map((value: T): T => value).find(fn);
    }

    public first(): Optional<T> {
        for (const key in this.__data) {
            if (this.__data.hasOwnProperty(key)) {
                return this.__data[key];
            }
        }
    }

}
