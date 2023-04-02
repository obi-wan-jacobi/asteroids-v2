import { HTML5CanvasViewport, IHTML5CanvasElement } from '@plasmastrapi/html5-canvas';
import IController from './interfaces/IController';
import { Index } from '@plasmastrapi/base';
import { Engine } from '@plasmastrapi/engine';
import { Stor } from '@plasmastrapi/ecs';

export default class App<TControllers extends Index<IController>> extends Engine<CanvasImageSource> {
  public readonly root: IHTML5CanvasElement;
  public readonly controllers: TControllers;

  public constructor({
    canvas,
    controllers,
    systems,
  }: {
    canvas: HTMLCanvasElement;
    controllers: TControllers;
    systems: Stor[];
  }) {
    super({
      viewport: new HTML5CanvasViewport({ canvas }),
      systems,
    });
    this.controllers = controllers;
  }

  public init(): void {
    for (const name in this.controllers) {
      this.controllers[name].init();
    }
  }

  public once(): void {
    super.once();
    (this.controllers.game as any).once();
  }
}
