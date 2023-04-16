import { transformShape } from '@plasmastrapi/geometry';
import { app } from 'app/main';
import { HTML5CanvasElement, IController } from '@plasmastrapi/html5-canvas';
import { LabelComponent, PoseComponent } from '@plasmastrapi/ecs';
import { COLOUR } from '@plasmastrapi/engine';

export default class HUDController implements IController {
  public init(): void {}

  public createStartBlurb(): void {
    new HTML5CanvasElement()
      .$add(PoseComponent, { x: 1280 / 2, y: 720 / 2, a: 0 })
      .$add(LabelComponent, { text: 'Press SPACE to begin...', fontSize: 40, offset: { x: -200, y: 0 } });
  }

  public drawRemainingLives(lives: number): void {
    const shipShape = {
      vertices: [
        { x: 20, y: 0 },
        { x: -10, y: -10 },
        { x: 0, y: 0 },
        { x: -10, y: 10 },
      ],
    };
    for (let i = 0; i < lives; i++) {
      const pose = { x: 20 + 22 * i, y: 30, a: -Math.PI / 2 };
      const transform = transformShape(shipShape, pose);
      app.viewport.drawShape({
        path: transform.vertices,
        style: { colour: COLOUR.RGBA_WHITE, fill: COLOUR.RGBA_0, opacity: 1, zIndex: 0 },
      });
    }
  }
}
