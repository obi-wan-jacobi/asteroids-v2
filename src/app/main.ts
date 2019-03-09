import App from './App';
import Engine from '../engine/Engine';
import HTML5CanvasMouseAdaptor from '../html5-canvas/HTML5CanvasMouseAdaptor';
import { HTML5CanvasViewportAdaptor } from '../html5-canvas/HTML5CanvasViewportAdaptor';
import $ from 'jquery';
import { AccelerationSystem, BoundarySytem, VelocitySystem } from './systems';

const canvas = $('#app-target').get(0) as HTMLCanvasElement;
canvas.width = 1280;
canvas.height = 680;

const game = new Engine();
game.systems.add(AccelerationSystem);
game.systems.add(VelocitySystem);
game.systems.add(BoundarySytem);

const ui = new Engine();

const app = new App({
    viewport: new HTML5CanvasViewportAdaptor(canvas),
    mouse: new HTML5CanvasMouseAdaptor(canvas),
    game,
    ui,
});
app.start();
