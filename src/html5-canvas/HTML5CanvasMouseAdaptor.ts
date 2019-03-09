import IAdaptedMouseEvent from '../engine/interfaces/IAdaptedMouseEvent';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';

export default class HTML5CanvasMouseAdaptor implements IMouseAdaptor {

    private __canvas: HTMLCanvasElement;
    private __buffer: IAdaptedMouseEvent[];

    constructor(canvas: HTMLCanvasElement) {
        this.__canvas = canvas;
        this.__buffer = [];
        this.__bindMouseEvents();
    }

    public once(handler: (mouseEvent: IAdaptedMouseEvent) => void): void {
        const input = this.__buffer.shift();
        if (input) {
            handler(input);
        }
    }

    private __bindMouseEvents(): void {
        [
            'mouseenter',
            'mousemove',
            'mouseleave',
            'mousedown',
            'mouseup',
            'click',
        ]
        .forEach((key) => {
            const canvas = (this.__canvas as unknown as { [key: string]: (ev: MouseEvent) => void });
            canvas[`on${key}`] = (ev: MouseEvent): void => {
                const boundingClientRect = this.__canvas.getBoundingClientRect();
                this.__buffer.push({
                    name: ev.type,
                    x: ev.clientX - boundingClientRect.left,
                    y: ev.clientY - boundingClientRect.top,
                    isCtrlDown: ev.ctrlKey,
                    isShiftDown: ev.shiftKey,
                });
            };
        });
    }

}
