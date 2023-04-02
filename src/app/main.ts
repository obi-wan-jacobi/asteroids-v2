import App from './App';
import { BooleanAsteroidSubtractorSystem } from './systems/BooleanAsteroidSubtractorSystem';
import GameController from './controllers/GameController';
import InputController from './controllers/InputController';
import ShipController from './controllers/ShipController';
import { AnimationSystem, ImageSystem, LabelSystem, LineSystem, PoseSystem, ShapeSystem } from '@plasmastrapi/engine';
import { AccelerationSystem, VelocitySystem } from '@plasmastrapi/physics';
import HUDController from './controllers/HUDController';
import HullSystem from './systems/HullSystem';
import { FPSSystem } from '@plasmastrapi/diagnostics';
import ThrusterSystem from './systems/ThrusterSystem';
import MissileLauncherSystem from './systems/MissileLauncherSystem';
import EphemeralSystem from './systems/EphemeralSystem';
import PositionalBoundarySystem from './systems/PositionalBoundarySystem';

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
    ImageSystem,
    AnimationSystem,
    VelocitySystem,
    AccelerationSystem,
    FPSSystem,

    PositionalBoundarySystem,
    ThrusterSystem,
    HullSystem,
    BooleanAsteroidSubtractorSystem,
    MissileLauncherSystem,
    EphemeralSystem,
  ],
});

app.init();
app.start();
