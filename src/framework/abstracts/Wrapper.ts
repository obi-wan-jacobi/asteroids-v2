import IWrapper from '../interfaces/IWrapper';

export default abstract class Wrapper<T extends {}> implements IWrapper<T> {

    private __target: T;

    constructor(target?: T) {
        this.__target = target || {} as T;
    }

    public unwrap(): T {
        return this.__target;
    }

}
