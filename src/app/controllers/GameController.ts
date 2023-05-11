import { IPose, Point } from '@plasmastrapi/geometry';
import { Entity, PoseComponent } from '@plasmastrapi/ecs';
import { app } from 'app/main';
import SetupInputHandler from 'app/input-handlers/SetupInputHandler';
import ShipInputHandler from 'app/input-handlers/ShipInputHandler';
import Ship from 'app/entities/Ship';
import Asteroid from 'app/entities/Asteroid';
import { IController } from '@plasmastrapi/html5-canvas';

export default class GameController implements IController {
  private __isStarted: boolean;
  private __isWaitingBeforeNextLevel: boolean;
  private __isWaitingToRespawn: boolean;
  private __level: number;
  private __remainingLives: number;

  public init(): void {
    this.__isStarted = false;
    this.__isWaitingBeforeNextLevel = false;
    this.__isWaitingToRespawn = false;
    this.__level = 0;
    this.__remainingLives = 3;
    app.controllers.hud.createStartBlurb();
    app.controllers.input.setHandler(SetupInputHandler);
  }

  public start(): void {
    this.__clearAll();
    this.__spawnShipAtCenterWhenSafe();
    this.__nextLevel();
    app.controllers.input.setHandler(ShipInputHandler);
    this.__isStarted = true;
  }

  public once(): void {
    if (!this.__isStarted) {
      return;
    }
    if (app.entities.count(Ship) === 0 && !this.__isWaitingToRespawn) {
      this.__isWaitingToRespawn = true;
      this.__remainingLives--;
      return this.__remainingLives <= 0
        ? this.__postpone(this.init, 2000)
        : this.__postpone(this.__spawnShipAtCenterWhenSafe, 1000);
    }
    if (app.entities.count(Asteroid) === 0 && !this.__isWaitingBeforeNextLevel) {
      this.__isWaitingBeforeNextLevel = true;
      this.__postpone(this.__nextLevel, 3000);
    }
    app.controllers.hud.drawRemainingLives(this.__remainingLives);
  }

  private __clearAll(): void {
    app.entities.forEvery(Entity)((entity) => entity.$destroy());
  }

  private __spawnShipAtCenterWhenSafe(): void {
    let isItSafeToSpawnShip = true;
    app.entities.forEvery(Asteroid)((asteroid) => {
      if (Point.getEuclideanDistanceBetweenPoints({ x: 640, y: 340 }, asteroid.$copy(PoseComponent)) < 100) {
        isItSafeToSpawnShip = false;
      }
    });
    if (isItSafeToSpawnShip) {
      this.__isWaitingToRespawn = false;
      return app.controllers.ship.spawn();
    }
    this.__postpone(this.__spawnShipAtCenterWhenSafe, 500);
  }

  private __nextLevel(): void {
    this.__level++;
    for (let i = 0, L = this.__level + 2; i < L; i++) {
      this.__spawnAsteroidAwayFromShip();
    }
    this.__isWaitingBeforeNextLevel = false;
  }

  private __spawnAsteroidAwayFromShip(): void {
    let pose = this.__generateAsteroidPose(1280, 720);
    const ship = app.entities.first(Ship)!;
    while (Point.getEuclideanDistanceBetweenPoints(ship.$copy(PoseComponent), pose) < 300) {
      pose = this.__generateAsteroidPose(1280, 720);
    }
    new Asteroid({
      pose,
      innerRadius: 100,
      outerRadius: 100,
      numberOfVertices: 20,
    });
  }

  private __generateAsteroidPose(width: number, height: number): IPose {
    return { x: width * Math.random(), y: height * Math.random(), a: 0 };
  }

  private __spawnAlienShipAtRandomEdge(): void {
    // const alien = new AlienShip({ pose: { x: 1, y: 340, a: 0 } });
  }

  private __postpone(next: () => void, ms: number): void {
    setTimeout(next.bind(this), ms);
  }
}
