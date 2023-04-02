import { IKeyboardEvent, KEYBOARD_EVENT } from '@plasmastrapi/html5-canvas';
import InputHandler from 'app/abstracts/InputHandler';
import { app } from '../main';

export default class SetupInputHandler extends InputHandler {
  public init(): void {}

  public dispose(): void {}

  [KEYBOARD_EVENT.KEY_UP](event: IKeyboardEvent): void {
    if (event.key === ' ') {
      app.controllers.game.start();
    }
  }
}
