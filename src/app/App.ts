import IEngine from '../engine/interfaces/IEngine';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';

export default class App {

    public viewport: IViewportAdaptor;
    public mouse: IMouseAdaptor;
    public keyboard: IKeyboardAdaptor;
    public engine: IEngine;

    private __onLoop: () => void;

    constructor({ viewport, mouse, keyboard, game }
        : { viewport: IViewportAdaptor, mouse: IMouseAdaptor, keyboard: IKeyboardAdaptor, game: IEngine },
    ) {
        this.viewport = viewport;
        this.mouse = mouse;
        this.keyboard = keyboard;
        this.engine = game;
        this.__onLoop = () => undefined;
    }

    public onLoop(onLoop: () => void): void {
        this.__onLoop = onLoop;
    }

    public once(): void {
        this.viewport.refresh();
        this.mouse.once();
        this.keyboard.once();
        this.engine.once();
        this.engine.draw();
        this.__onLoop();
    }

    public start(): void {
        setInterval(this.once.bind(this), 1000 / 60);
    }

}
