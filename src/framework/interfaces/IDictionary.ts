
export default interface IDictionary<T> {

    length: number;

    read(key: string): T;

    write({ key, value }: { key: string, value: T }): void;

    delete(key: string): void;

    flush(): void;

    forEach(fn: (value: T) => void): void;

}
