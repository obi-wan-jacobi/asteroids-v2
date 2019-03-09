import IAdaptedKeyboardEvent from './IAdaptedKeyboardEvent';

export default interface IKeyboardAdaptor {
    once(handler: (keyboardEvent: IAdaptedKeyboardEvent) => void): void;
}
