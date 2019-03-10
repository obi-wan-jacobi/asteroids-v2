import { Optional } from '../types';

export default interface IDictionary<T> {

    length: number;

    read(key: string): T;

    write({ key, value }: { key: string, value: T }): void;

    delete(key: string): void;

    flush(): void;

    forEach(fn: (value: T) => void): void;

    map(fn: (value: T) => any): any[];

    find(fn: (value: T) => boolean): T;

    first(): Optional<T>;

}
