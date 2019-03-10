import App from './App';
import Engine from '../engine/Engine';
import { Entity } from '../engine/Entity';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import IAdaptedKeyboardEvent from '../engine/interfaces/IAdaptedKeyboardEvent';
import { Label, Pose, Steering } from './components';
import { Ship } from './entities';
import $ from 'jquery';
import {
    BoundarySytem, EphemeralSystem, FlairSystem, LabelSystem, ShapeSystem, SteeringSystem, ThrustSystem, VelocitySystem,
} from './systems';

const canvas = $('#app-target').get(0) as HTMLCanvasElement;
canvas.width = 1280;
canvas.height = 680;

const game = new Engine();

game.systems.add(VelocitySystem);
game.systems.add(BoundarySytem);
game.systems.add(SteeringSystem);
game.systems.add(ThrustSystem);
game.systems.add(EphemeralSystem);

const app = new App({
    viewport: new HTML5CanvasViewportAdaptor(canvas),
    mouse: new HTML5CanvasMouseAdaptor(canvas),
    keyboard: new HTML5CanvasKeyboardAdapter(canvas),
    game,
});

game.drawSystems.add(LabelSystem, { viewport: app.viewport });
game.drawSystems.add(ShapeSystem, { viewport: app.viewport });
game.drawSystems.add(FlairSystem, { viewport: app.viewport });

app.start();

const setup = (): void => {
    const startBlurb = game.entities.create(Entity);
    startBlurb.add(Pose)({ x: 1280 / 2, y: 680 / 2, a: 0 });
    startBlurb.add(Label)({ text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
    const startKeyboardHandler = {
        keydown: (keyboardEvent: IAdaptedKeyboardEvent) => undefined,
        keypress: (keyboardEvent: IAdaptedKeyboardEvent) => undefined,
        keyup: (keyboardEvent: IAdaptedKeyboardEvent) => {
            if (keyboardEvent.key === ' ') {
                app.game.entities.destroy(startBlurb);
                begin();
            }
        },
    };
    app.keyboard.handler(startKeyboardHandler);
};
setup();

const begin = (): void => {
    const ship = app.game.entities.create(Ship);
    const shipKeyboardHandler = {
        keydown: (keyboardEvent: IAdaptedKeyboardEvent) => {
            if (keyboardEvent.key === 'w') {
                ship.accelerate();
            }
            if (keyboardEvent.key === ' ') {
                ship.spawnMissile(game.entities);
            }
        },
        keypress: (keyboardEvent: IAdaptedKeyboardEvent) => {
            if (keyboardEvent.key === 'a') {
                return ship.turn('LEFT');
            }
            if (keyboardEvent.key === 'd') {
                return ship.turn('RIGHT');
            }
        },
        keyup: (keyboardEvent: IAdaptedKeyboardEvent) => {
            if (keyboardEvent.key === 'w') {
                ship.idle();
            }
            const steering = ship.copy(Steering);
            if (keyboardEvent.key === 'a' && steering.direction === 'LEFT') {
                return ship.turn('NONE');
            }
            if (keyboardEvent.key === 'd' && steering.direction === 'RIGHT') {
                return ship.turn('NONE');
            }
        },
    };
    app.keyboard.handler(shipKeyboardHandler);
};
