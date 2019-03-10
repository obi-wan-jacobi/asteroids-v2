import IAdaptedKeyboardEvent from './IAdaptedKeyboardEvent';

export default interface IKeyboardHandler {
    [key: string]: (keyboardEvent: IAdaptedKeyboardEvent) => void;
    keydown: (keyboardEvent: IAdaptedKeyboardEvent) => void;
    keypress: (keyboardEvent: IAdaptedKeyboardEvent) => void;
    keyup: (keyboardEvent: IAdaptedKeyboardEvent) => void;
}
