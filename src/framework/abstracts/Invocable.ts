
export interface IInvocable<TPayload, TResult> {

    invoke(payload: TPayload): TResult;

}
export default abstract class Invocable<TPayload, TResult> implements IInvocable<TPayload, TResult> {

    protected _method: (payload: TPayload) => TResult;

    constructor({ fn }: { fn: (payload: TPayload) => TResult }) {
        this._method = fn;
    }

    public invoke(payload: TPayload): TResult {
        return this._method(payload);
    }

}
