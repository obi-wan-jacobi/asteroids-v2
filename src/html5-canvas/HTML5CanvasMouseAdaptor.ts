import IAdaptedMouseEvent from '../engine/interfaces/IAdaptedMouseEvent';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';
import IMouseHandler from '../engine/interfaces/IMouseHandler';

const __defaultHandler = {
    mouseenter: (mouseEvent: IAdaptedMouseEvent) => undefined,
    mousemove: (mouseEvent: IAdaptedMouseEvent) => undefined,
    mouseleave: (mouseEvent: IAdaptedMouseEvent) => undefined,
    mousedown: (mouseEvent: IAdaptedMouseEvent) => undefined,
    mouseup: (mouseEvent: IAdaptedMouseEvent) => undefined,
    click: (mouseEvent: IAdaptedMouseEvent) => undefined,
};

export default class HTML5CanvasMouseAdaptor implements IMouseAdaptor {

    private __canvas: HTMLCanvasElement;
    private __buffer: IAdaptedMouseEvent[];
    private __handler: IMouseHandler;

    constructor(canvas: HTMLCanvasElement) {
        this.__canvas = canvas;
        this.__buffer = [];
        this.__handler = __defaultHandler;
        this.__bindMouseEvents();
    }

    public once(): void {
        const event = this.__buffer.shift();
        if (event) {
            this.__handler.click(event);
        }
    }

    public handler(handler: IMouseHandler): void {
        this.__handler = handler;
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
