import IEngine from '../engine/interfaces/IEngine';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';

let loop: NodeJS.Timeout;
export default class App {

    public viewport: IViewportAdaptor;
    public mouse: IMouseAdaptor;
    public keyboard: IKeyboardAdaptor;
    public engine: IEngine;

    private __isPaused: boolean;

    constructor({ viewport, mouse, keyboard, game }
        : { viewport: IViewportAdaptor, mouse: IMouseAdaptor, keyboard: IKeyboardAdaptor, game: IEngine },
    ) {
        this.viewport = viewport;
        this.mouse = mouse;
        this.keyboard = keyboard;
        this.engine = game;
        this.__isPaused = false;
    }

    public get isPaused(): boolean {
        return this.__isPaused;
    }

    public once(): void {
        this.viewport.refresh();
        this.mouse.once();
        this.keyboard.once();
        if (!this.__isPaused) {
            this.engine.once();
        }
        this.engine.draw();
    }

    public start(): void {
        loop = setInterval(this.once.bind(this), 1000 / 60);
    }

    public stop(): void {
        clearInterval(loop);
    }

    public pause(): void {
        this.__isPaused = true;
    }

    public unpause(): void {
        this.__isPaused = false;
    }

    public tick(): void {
        this.engine.once();
    }

}
