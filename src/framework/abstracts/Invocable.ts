
export interface IInvocable<TPayload, TResult> {

    invoke(payload: TPayload): TResult;

}
export default abstract class Invocable<TPayload, TResult> implements IInvocable<TPayload, TResult> {

    protected _method: (payload: TPayload) => TResult;

    constructor({ method }: { method: (payload: TPayload) => TResult }) {
        this._method = method;
    }

    public invoke(payload: TPayload): TResult {
        return this._method(payload);
    }

}
