import IAdaptedMouseEvent from './IAdaptedMouseEvent';

export default interface IMouseAdaptor {
    once(handler: (mouseEvent: IAdaptedMouseEvent) => void): void;
}
