import App from './App';
import Engine from '../engine/Engine';
import { Entity } from '../engine/Entity';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import KeyboardHandler from '../engine/KeyboardHandler';
import { Label, Pose } from './components';
import { Asteroid, Ship } from './entities';
import $ from 'jquery';
import {
    AccelerationSystem, BooleanAsteroidSubtractorSystem,
    EphemeralSystem, FPSSystem, FlairSystem, LabelSystem,
    MissileLauncherSystem, MissileSystem, MovementSystem, ShapeSystem, ThrustSystem,
} from './systems';

const canvas = $('#app-target').get(0) as HTMLCanvasElement;
canvas.focus();
canvas.width = 1280;
canvas.height = 680;

const viewport = new HTML5CanvasViewportAdaptor(canvas);

const app = new App({
    viewport,
    mouse: new HTML5CanvasMouseAdaptor(canvas),
    keyboard: new HTML5CanvasKeyboardAdapter(canvas),
    game: new Engine(viewport),
});

app.engine.add(AccelerationSystem);
app.engine.add(ThrustSystem);
app.engine.add(MovementSystem);
app.engine.add(MissileSystem);
app.engine.add(BooleanAsteroidSubtractorSystem);
app.engine.add(LabelSystem);
app.engine.add(ShapeSystem);
app.engine.add(FlairSystem);
app.engine.add(MissileLauncherSystem);
app.engine.add(EphemeralSystem);
app.engine.add(FPSSystem);

app.start();

const setup = (): void => {
    const startBlurb = app.engine.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    const startKeyboardHandler = new KeyboardHandler();
    startKeyboardHandler.keyups = {
        ' ': () => {
            app.engine.entities.destroy(startBlurb);
            begin();
        },
    };
    app.keyboard.handler(startKeyboardHandler);
    startKeyboardHandler.keyups[' ']({ name: 'skip', key: ' ' });
};

const begin = (): void => {
    const ship = app.engine.entities.create(Ship, { pose: { x: 640, y: 340, a: -Math.PI / 2 } });
    const shipKeyboardHandler = new KeyboardHandler();
    shipKeyboardHandler.keydowns = {
        ArrowUp: () => ship.accelerate(),
        ArrowLeft: () => ship.turnLeft(),
        ArrowRight: () => ship.turnRight(),
        ' ': () => ship.shoot(),
    };
    shipKeyboardHandler.keyups = {
        ArrowUp: () => ship.idle(),
        ArrowLeft: () => ship.stopTurningLeft(),
        ArrowRight: () => ship.stopTurningRight(),
        r: () => app.engine.entities.create(Asteroid, {
            pose: { x: 1080 * Math.random(), y: 680 * Math.random(), a: 2 * Math.PI * Math.random() }, radius: 200,
        }),
    };
    app.keyboard.handler(shipKeyboardHandler);
};

setup();
