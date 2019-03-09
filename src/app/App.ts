import Engine from '../engine/Engine';
import IAdaptedMouseEvent from '../engine/interfaces/IAdaptedMouseEvent';
import IKeyboardAdaptor from '../engine/interfaces/IKeyboardAdaptor';
import IMouseAdaptor from '../engine/interfaces/IMouseAdaptor';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';
import { isPointInsideShape } from './geometry';
import { Pose, Shape } from './objects';
import { Interactive } from './ui';

let loop: NodeJS.Timeout;
export default class App {

    private __viewport: IViewportAdaptor;
    private __mouse: IMouseAdaptor;
    private __keyboard: IKeyboardAdaptor;
    private __ui: Engine;
    private __game: Engine;

    private __isPaused: boolean;

    constructor({ viewport, mouse, keyboard, ui, game }
        : { viewport: IViewportAdaptor, mouse: IMouseAdaptor, keyboard: IKeyboardAdaptor, ui: Engine, game: Engine },
    ) {
        this.__viewport = viewport;
        this.__mouse = mouse;
        this.__keyboard = keyboard;
        this.__ui = ui;
        this.__game = game;
        this.__isPaused = false;
    }

    public get isPaused(): boolean {
        return this.__isPaused;
    }

    public once(): void {
        this.__viewport.refresh();
        this.__mouse.once((mouseEvent: IAdaptedMouseEvent) => {
            this.__ui.components.get(Interactive).forEach((entity) => {
                if (!isPointInsideShape(mouseEvent, entity.copy(Shape), entity.copy(Pose))) {
                    return;
                }
                const interactive = entity.copy(Interactive);
                if (mouseEvent.name === 'click') {
                    interactive.click(mouseEvent);
                }
            });
        });
        if (!this.__isPaused) {
            this.tick();
        }
        this.__game.draw(this.__viewport);
        this.__ui.once();
        this.__ui.draw(this.__viewport);
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
        this.__game.once();
    }

}
