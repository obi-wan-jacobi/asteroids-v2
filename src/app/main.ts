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
    BoundarySytem, CollisionSystem, EphemeralSystem, FlairSystem, LabelSystem,
    ShapeSystem, SteeringSystem, ThrustSystem, VelocitySystem,
} from './systems';

const canvas = $('#app-target').get(0) as HTMLCanvasElement;
canvas.focus();
canvas.width = 1280;
canvas.height = 680;

const app = new App({
    viewport: new HTML5CanvasViewportAdaptor(canvas),
    mouse: new HTML5CanvasMouseAdaptor(canvas),
    keyboard: new HTML5CanvasKeyboardAdapter(canvas),
    game: new Engine(),
});

app.game.systems.add(VelocitySystem);
app.game.systems.add(BoundarySytem);
app.game.systems.add(SteeringSystem);
app.game.systems.add(ThrustSystem);
app.game.systems.add(EphemeralSystem);

app.game.systems.add(CollisionSystem, app.game.entities);

app.game.drawSystems.add(LabelSystem, { viewport: app.viewport });
app.game.drawSystems.add(ShapeSystem, { viewport: app.viewport });
app.game.drawSystems.add(FlairSystem, { viewport: app.viewport });

app.start();

const setup = (): void => {
    const startBlurb = app.game.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    const startKeyboardHandler = new KeyboardHandler();
    startKeyboardHandler.keyups = {
        ' ': () => {
            app.game.entities.destroy(startBlurb);
            begin();
        },
    };
    app.keyboard.handler(startKeyboardHandler);
    startKeyboardHandler.keyups[' ']({ name: 'skip', key: ' ' });
};

const begin = (): void => {
    const ship = app.game.entities.create(Ship);
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
        r: () => app.game.entities.create(Asteroid, { pose: { x: 200, y: 200, a: 0 }, radius: 100 }),
    };
    app.keyboard.handler(shipKeyboardHandler);
};

setup();
