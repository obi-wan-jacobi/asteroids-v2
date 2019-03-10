import IAdaptedKeyboardEvent from '../engine/interfaces/IAdaptedKeyboardEvent';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';
import IKeyboardHandler from '../engine/interfaces/IKeyboardHandler';

export default class HTML5CanvasKeyboardAdapter implements IKeyboardAdaptor {

    private __canvas: HTMLCanvasElement;
    private __buffer: IAdaptedKeyboardEvent[];
    private __handler: IKeyboardHandler;

    constructor(canvas: HTMLCanvasElement) {
        this.__canvas = canvas;
        this.__buffer = [];
        this.__bindKeyboardEvents();
    }

    public once(): void {
        const input = this.__buffer.shift();
        if (input) {
            this.__handler[input.name](input);
        }
    }

    public handler(handler: IKeyboardHandler): void {
        this.__handler = handler;
    }

    private __bindKeyboardEvents(): void {
        [
            'keydown',
            'keypress',
            'keyup',
        ]
        .forEach((key) => {
            const canvas = (this.__canvas as unknown as { [key: string]: (ke: KeyboardEvent) => void });
            canvas[`on${key}`] = (ke: KeyboardEvent): void => {
                this.__buffer.push({
                    name: key,
                    key: ke.key,
                });
            };
        });
    }

}
