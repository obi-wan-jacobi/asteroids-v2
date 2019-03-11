import Engine from '../engine/Engine';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';

let loop: NodeJS.Timeout;
export default class App {

    public viewport: IViewportAdaptor;
    public mouse: IMouseAdaptor;
    public keyboard: IKeyboardAdaptor;
    public game: Engine;

    private __isPaused: boolean;

    constructor({ viewport, mouse, keyboard, game }
        : { viewport: IViewportAdaptor, mouse: IMouseAdaptor, keyboard: IKeyboardAdaptor, game: Engine },
    ) {
        this.viewport = viewport;
        this.mouse = mouse;
        this.keyboard = keyboard;
        this.game = game;
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
            this.game.once();
        }
        this.game.draw();
    }

    public start(): void {
        loop = setInterval(this.once.bind(this), 1000 / 120);
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
        this.game.once();
    }

}
