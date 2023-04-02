import { Index } from '@plasmastrapi/base';
import { IKeyboardEvent, KEYBOARD_EVENT } from '@plasmastrapi/html5-canvas';
import InputHandler from 'app/abstracts/InputHandler';
import { app } from 'app/main';

export default class ShipInputHandler extends InputHandler {
  private __keyDownMap: Index<Function> = {
    ArrowUp: () => app.controllers.ship.accelerate(),
    ArrowLeft: () => app.controllers.ship.turnLeft(),
    ArrowRight: () => app.controllers.ship.turnRight(),
    ' ': () => app.controllers.ship.shoot(),
  };

  private __keyUpMap: Index<Function> = {
    ArrowUp: () => app.controllers.ship.idle(),
    ArrowLeft: () => app.controllers.ship.stopTurningLeft(),
    ArrowRight: () => app.controllers.ship.stopTurningRight(),
  };

  public init(): void {
    app.controllers.ship.init();
  }

  public dispose(): void {}

  [KEYBOARD_EVENT.KEY_DOWN](event: IKeyboardEvent): void {
    if (this.__keyDownMap[event.key]) {
      this.__keyDownMap[event.key]();
    }
  }

  [KEYBOARD_EVENT.KEY_UP](event: IKeyboardEvent): void {
    if (this.__keyUpMap[event.key]) {
      this.__keyUpMap[event.key]();
    }
  }
}
