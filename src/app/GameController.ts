import App from './App';
import { Entity } from '../engine/Entity';
import IEntity from '../engine/interfaces/IEntity';
import KeyboardHandler from '../engine/KeyboardHandler';
import ShipController from './ShipController';
import { IPose, Label, Pose, Shape } from './components';
import { Asteroid, Ship } from './entities';
import { getEuclideanDistanceBetweenPoints, transformShape } from './geometry';
import { Ctor } from '../framework/types';

const DO_NOTHING = () => undefined;

export default class GameController {

    private __app: App;
    private __level: number;
    private __lives: number;
    private __ship: Ship;

    constructor(app: App) {
        this.__app = app;
    }

    public setup(): void {
        this.__level = 0;
        this.__lives = 3;
        this.__app.onLoop(DO_NOTHING);
        this.clearAll();
        this.createStartBlurb();
        this.registerSetupKeyboardHandler();
    }

    public clearAll(): void {
        this.__app.engine.entities.forEach((entity) => entity.destroy());
    }

    public createStartBlurb(): void {
        const startBlurb = this.__app.engine.entities.create(Entity);
        startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
        startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    }

    public registerSetupKeyboardHandler(): void {
        const setupKeyboardHandler = new KeyboardHandler();
        setupKeyboardHandler.keyups = {
            ' ': () => {
                this.clearAll();
                this.spawnShip();
                this.nextLevel();
            },
        };
        this.__app.keyboard.handler(setupKeyboardHandler);
    }

    public spawnShip(): void {
        this.__app.onLoop(this.onLoop.bind(this));
        this.__lives--;
        this.__ship = this.__app.engine.entities.create(Ship, { pose: { x: 640, y: 340, a: -Math.PI / 2 } });
        const shipController = new ShipController(this.__ship);
        const shipKeyboardHandler = new KeyboardHandler();
        shipKeyboardHandler.keydowns = {
            ArrowUp: () => shipController.accelerate(),
            ArrowLeft: () => shipController.turnLeft(),
            ArrowRight: () => shipController.turnRight(),
            ' ': () => shipController.shoot(),
        };
        shipKeyboardHandler.keyups = {
            ArrowUp: () => shipController.idle(),
            ArrowLeft: () => shipController.stopTurningLeft(),
            ArrowRight: () => shipController.stopTurningRight(),
        };
        this.__app.keyboard.handler(shipKeyboardHandler);
    }

    public nextLevel(): void {
        this.__app.onLoop(this.onLoop.bind(this));
        this.__level++;
        for (let i = 0, L = this.__level + 2; i < L; i++) {
            this.spawnAsteroidAwayFromShip();
        }
    }

    public spawnAsteroidAwayFromShip(): void {
        let pose = this.generateAsteroidPose(1080, 640);
        while (getEuclideanDistanceBetweenPoints(this.__ship.copy(Pose), pose) < 250) {
            pose = this.generateAsteroidPose(1080, 640);
        }
        this.__app.engine.entities.create(Asteroid, {
            pose,
            innerRadius: 100,
            outerRadius: 100,
            numberOfVertices: 20 + Math.ceil(20 * Math.random()),
        });
    }

    public generateAsteroidPose(width: number, height: number): IPose {
        return { x: width * Math.random(), y: height * Math.random(), a: 0 };
    }

    public onLoop(): void {
        if (this.countRemaining(Ship) === 0) {
            return this.postpone((this.__lives <= 0) ? this.setup : this.spawnShip, 2000);
        }
        if (this.countRemaining(Asteroid) === 0) {
            this.postpone(this.nextLevel, 2000);
        }
        this.drawRemainingLives();
    }

    public postpone(next: () => void, ms: number): void {
        this.__app.onLoop(DO_NOTHING);
        setTimeout(next.bind(this), ms);
    }

    public countRemaining(InstanceCtor: Ctor<IEntity, any>): number {
        let count = 0;
        this.__app.engine.entities.forEvery(InstanceCtor)((asteroid) => {
            count++;
        });
        return count;
    }

    public drawRemainingLives(): void {
        for (let i = 0; i < this.__lives; i++) {
            const pose = { x: 20 + 22 * i, y: 30, a: -Math.PI / 2 };
            const transform = transformShape(this.__ship.copy(Shape), pose);
            this.__app.viewport.drawShape({ shape: transform, rendering: { colour: 'white' } });
        }
    }

}
