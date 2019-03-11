import IAdaptedKeyboardEvent from './interfaces/IAdaptedKeyboardEvent';
import IKeyboardHandler from './interfaces/IKeyboardHandler';

export default class KeyboardHandler implements IKeyboardHandler {

    [key: string]: any

    public keydowns: { [key: string]: (keyboardEvent: IAdaptedKeyboardEvent) => void };
    public keypresses: { [key: string]: (keyboardEvent: IAdaptedKeyboardEvent) => void };
    public keyups: { [key: string]: (keyboardEvent: IAdaptedKeyboardEvent) => void };

    constructor() {
        this.keydowns = {};
        this.keypresses = {};
        this.keyups = {};
    }

    public keydown(keyboardEvent: IAdaptedKeyboardEvent): void {
        this.__handle(keyboardEvent, this.keydowns);
    }

    public keypress(keyboardEvent: IAdaptedKeyboardEvent): void {
        this.__handle(keyboardEvent, this.keypresses);
    }

    public keyup(keyboardEvent: IAdaptedKeyboardEvent): void {
        this.__handle(keyboardEvent, this.keyups);
    }

    private __handle(
        keyboardEvent: IAdaptedKeyboardEvent,
        keys: { [key: string]: (keyboardEvent: IAdaptedKeyboardEvent) => void },
    ): void {
        if (keys[keyboardEvent.key]) {
            keys[keyboardEvent.key](keyboardEvent);
        }
    }

}
