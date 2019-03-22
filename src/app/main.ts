import App from './App';
import Engine from '../engine/Engine';
import { Entity } from '../engine/Entity';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import IEntity from '../engine/interfaces/IEntity';
import KeyboardHandler from '../engine/KeyboardHandler';
import { IPose, Label, Pose, Shape } from './components';
import { Asteroid, Ship } from './entities';
import { getEuclideanDistanceBetweenPoints, transformShape } from './geometry';
import $ from 'jquery';
import {
    AccelerationSystem, BooleanAsteroidSubtractorSystem,
    EphemeralSystem, FPSSystem, FlairSystem, HullSystem,
    LabelSystem, MissileLauncherSystem, MovementSystem, ShapeSystem, ThrustSystem,
} from './systems';
import { Ctor } from '../framework/types';

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

let LEVEL = 0;
let LIVES = 3;
let ship: Ship;
const setup = (): void => {
    LEVEL = 0;
    app.onLoop(() => undefined);
    destroyAllEntities();
    createStartBlurb();
    registerSetupKeyboardHandler();
};

const destroyAllEntities = (): void => {
    app.engine.entities.forEach((entity) => entity.destroy());
};

const createStartBlurb = (): void => {
    const startBlurb = app.engine.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
};

const registerSetupKeyboardHandler = (): void => {
    const setupKeyboardHandler = new KeyboardHandler();
    setupKeyboardHandler.keyups = {
        ' ': () => {
            destroyAllEntities();
            spawnShip();
            nextLevel();
        },
    };
    app.keyboard.handler(setupKeyboardHandler);
};

const spawnShip = (): void => {
    app.onLoop(onLoop);
    LIVES--;
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
};

const nextLevel = (): void => {
    app.onLoop(onLoop);
    LEVEL++;
    for (let i = 0, L = LEVEL + 2; i < L; i++) {
        spawnAsteroidAwayFromShip();
    }
};

const spawnAsteroidAwayFromShip = (): void => {
    let pose = generateAsteroidPose(1080, 640);
    while (getEuclideanDistanceBetweenPoints(ship.copy(Pose), pose) < 250) {
        pose = generateAsteroidPose(1080, 640);
    }
    app.engine.entities.create(Asteroid, {
        pose,
        innerRadius: 100,
        outerRadius: 100,
        numberOfVertices: 20 + Math.ceil(20 * Math.random()),
    });
};

const generateAsteroidPose = (width: number, height: number): IPose => {
    return { x: width * Math.random(), y: height * Math.random(), a: 0 };
};

const onLoop = (): void => {
    if (countRemaining(Ship) === 0) {
        return postpone((LIVES <= 0) ? setup : spawnShip, 2000);
    }
    if (countRemaining(Asteroid) === 0) {
        postpone(nextLevel, 2000);
    }
    drawRemainingLives();
};

const postpone = (next: () => void, ms: number): void => {
    app.onLoop(() => undefined);
    setTimeout(next, ms);
};

const countRemaining = (InstanceCtor: Ctor<IEntity, any>): number => {
    let count = 0;
    app.engine.entities.forEvery(InstanceCtor)((asteroid) => {
        count++;
    });
    return count;
};

const drawRemainingLives = () => {
    for (let i = 0; i < LIVES; i++) {
        const pose = { x: 20 + 22 * i, y: 30, a: -Math.PI / 2 };
        const transform = transformShape(ship.copy(Shape), pose);
        app.viewport.drawShape({ shape: transform, rendering: { colour: 'white' } });
    }
};

setup();
