import IMouseHandler from './IMouseHandler';

export default interface IMouseAdaptor {
    once(): void;
    handler(handler: IMouseHandler): void;
}
