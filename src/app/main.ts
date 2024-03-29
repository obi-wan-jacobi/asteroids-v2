import App from './App';
import { BooleanAsteroidSubtractorSystem } from './systems/BooleanAsteroidSubtractorSystem';
import GameController from './controllers/GameController';
import ShipController from './controllers/ShipController';
import { LabelSystem, LineSystem, PoseSystem, ShapeSystem } from '@plasmastrapi/engine';
import { AccelerationSystem, VelocitySystem } from '@plasmastrapi/physics';
import HUDController from './controllers/HUDController';
import DestructibleHullSystem from './systems/DestructibleHullSystem';
import { FPSSystem } from '@plasmastrapi/diagnostics';
import ThrusterSystem from './systems/ThrusterSystem';
import MissileLauncherSystem from './systems/MissileLauncherSystem';
import EphemeralSystem from './systems/EphemeralSystem';
import PositionalBoundarySystem from './systems/PositionalBoundarySystem';
import { InputController } from '@plasmastrapi/html5-canvas';

const canvas = document.getElementById('app-target') as HTMLCanvasElement;
canvas.width = 1280;
canvas.height = 720;
canvas.focus();

export const app = new App({
  canvas,
  controllers: {
    game: new GameController(),
    hud: new HUDController(),
    input: new InputController({ canvas }),
    ship: new ShipController(),
  },
  systems: [
    PoseSystem,
    ShapeSystem,
    LineSystem,
    LabelSystem,
    VelocitySystem,
    AccelerationSystem,
    FPSSystem,

    PositionalBoundarySystem,
    ThrusterSystem,
    DestructibleHullSystem,
    MissileLauncherSystem,
    BooleanAsteroidSubtractorSystem,
    EphemeralSystem,
  ],
});

app.init();
app.start();
