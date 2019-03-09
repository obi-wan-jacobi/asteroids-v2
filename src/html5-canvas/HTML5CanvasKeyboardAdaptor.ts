import IAdaptedKeyboardEvent from '../engine/interfaces/IAdaptedKeyboardEvent';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';

export default class HTML5CanvasKeyboardAdapter implements IKeyboardAdaptor {

    private __canvas: HTMLCanvasElement;
    private __buffer: IAdaptedKeyboardEvent[];

    constructor(canvas: HTMLCanvasElement) {
        this.__canvas = canvas;
        this.__buffer = [];
        this.__bindKeyboardEvents();
    }

    public once(handler: (keyboardEvent: IAdaptedKeyboardEvent) => void): void {
        const input = this.__buffer.shift();
        if (input) {
            handler(input);
        }
    }

    private __bindKeyboardEvents(): void {
        [
            'keydown',
            'keyup',
            'keypress',
        ]
        .forEach((key) => {
            const canvas = (this.__canvas as unknown as { [key: string]: (ke: KeyboardEvent) => void });
            canvas[`on${key}`] = (ke: KeyboardEvent): void => {
                this.__buffer.push({
                    name: ke.key,
                });
            };
        });
    }

}
