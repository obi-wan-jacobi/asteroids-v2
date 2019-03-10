import IComponent from './interfaces/IComponent';

export abstract class Component<T extends {}> implements IComponent<T> {

    private __data: T;

    constructor(data: T) {
        this.mutate(data);
    }

    public copy(): T {
        return this._clone(this.__data);
    }

    public mutate(data: T): void {
        this.__data = this._clone(data);
    }

    protected _clone(data: T): T {
        return JSON.parse(JSON.stringify(data));
    }

}
