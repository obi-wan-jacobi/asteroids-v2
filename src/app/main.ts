import App from './App';
import Engine from '../engine/Engine';
import GameController from './GameController';
import HTML5CanvasKeyboardAdapter from '../html5-canvas/HTML5CanvasKeyboardAdaptor';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
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

const gameController = new GameController(app);
gameController.setup();
