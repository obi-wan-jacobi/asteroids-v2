import App from './App';
import Engine from '../engine/Engine';
import { Entity } from '../engine/Entity';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import KeyboardHandler from '../engine/KeyboardHandler';
import { IPose, Label, Pose } from './components';
import { Asteroid, Ship } from './entities';
import { getEuclideanDistanceBetweenPoints } from './geometry';
import $ from 'jquery';
import {
    AccelerationSystem, BooleanAsteroidSubtractorSystem,
    EphemeralSystem, FPSSystem, FlairSystem, HullSystem,
    LabelSystem, MissileLauncherSystem, MovementSystem, ShapeSystem, ThrustSystem,
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
app.engine.add(HullSystem);
app.engine.add(BooleanAsteroidSubtractorSystem);
app.engine.add(LabelSystem);
app.engine.add(ShapeSystem);
app.engine.add(FlairSystem);
app.engine.add(MissileLauncherSystem);
app.engine.add(EphemeralSystem);
app.engine.add(FPSSystem);

app.start();

const setup = (): void => {
    app.engine.entities.forEach((entity) => entity.destroy());
    const startBlurb = app.engine.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    const setupKeyboardHandler = new KeyboardHandler();
    setupKeyboardHandler.keyups = {
        ' ': () => {
            app.engine.entities.destroy(startBlurb);
            ship = app.engine.entities.create(Ship, { pose: { x: 640, y: 340, a: -Math.PI / 2 } });
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
            };
            app.keyboard.handler(shipKeyboardHandler);
            nextLevel();
        },
    };
    app.keyboard.handler(setupKeyboardHandler);
    setupKeyboardHandler.keyups[' ']({ name: 'skip', key: ' ' });
};

const LEVEL = 1;
let ship: Ship;
const nextLevel = (): void => {
    for (let i = 0, L = LEVEL + 2; i < L; i++) {
        spawnAsteroidAwayFromShip();
    }
};

const spawnAsteroidAwayFromShip = (): void => {
    let pose = generatePose(1080, 640);
    while (getEuclideanDistanceBetweenPoints(ship.copy(Pose), pose) < 250) {
        pose = generatePose(1080, 640);
    }
    app.engine.entities.create(Asteroid, {
        pose,
        innerRadius: 100,
        outerRadius: 100,
        numberOfVertices: 20 + Math.ceil(20 * Math.random()),
    });
};

const generatePose = (width: number, height: number): IPose => {
    return { x: width * Math.random(), y: height * Math.random(), a: 0 };
};

setup();
