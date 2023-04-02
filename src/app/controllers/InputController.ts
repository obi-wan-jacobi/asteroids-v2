import { Constructor, Index, Void } from '@plasmastrapi/base';
import {
  IEvent,
  IHTML5EventTransform,
  IKeyboardEvent,
  IMouseEvent,
  KEYBOARD_EVENT,
  MOUSE_EVENT,
} from '@plasmastrapi/html5-canvas';
import IController from 'app/interfaces/IController';
import IInputHandler from 'app/interfaces/IInputHandler';

export default class InputController implements IController {
  private __canvas: HTMLCanvasElement;
  private __handler: IInputHandler;
  private __mouse: IMouseEvent = {} as IMouseEvent;
  private __keyboard: IKeyboardEvent = {} as IKeyboardEvent;

  public constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.__canvas = canvas;
  }

  public init(): void {
    bindEvents({
      element: this.__canvas,
      eventNames: Object.keys(MOUSE_EVENT).map((event) => (MOUSE_EVENT as Index<string>)[event]),
      eventMapper: adaptCanvasMouseEvent,
      callback: this.__handleMouseEvent.bind(this),
    });
    bindEvents({
      element: this.__canvas,
      eventNames: Object.keys(KEYBOARD_EVENT).map((event) => (KEYBOARD_EVENT as Index<string>)[event]),
      eventMapper: adaptCanvasKeyboardEvent,
      callback: this.__handleKeyboardEvent.bind(this),
    });
  }

  public setHandler<TArgs>(Handler: Constructor<IInputHandler, TArgs>, args?: TArgs): void {
    this.__handler?.dispose();
    this.__handler = new Handler(args!);
    this.__handler.init({ x: this.__mouse.x, y: this.__mouse.y, ...args });
  }

  private __handleMouseEvent(event: IMouseEvent): void {
    this.__mouse = event;
    if (this.__handler[event.name]) {
      this.__handler[event.name](event);
    }
  }

  private __handleKeyboardEvent(event: IKeyboardEvent): void {
    this.__keyboard = event;
    // cache handler now because some events might otherwise set a new handler
    // "before" this one has a chance to execute on this event
    const handler = this.__handler;
    if (handler[event.name]) {
      handler[event.name](event);
    }
  }
}

const bindEvents = <TSourceEvent extends Event, TAdaptedEvent extends IEvent>({
  element,
  eventNames,
  eventMapper,
  callback,
}: IHTML5EventTransform<HTMLCanvasElement, TSourceEvent, TAdaptedEvent>): void => {
  eventNames.forEach((name) => {
    (element as unknown as Index<Void<TSourceEvent>>)[`on${name}`] = (event: TSourceEvent): void => {
      const adaptedEvent = eventMapper({
        event,
        element,
      });
      callback(adaptedEvent);
    };
  });
};

const adaptCanvasMouseEvent = ({ event, element }: { event: MouseEvent; element: HTMLCanvasElement }): IMouseEvent => {
  const boundingClientRect = element.getBoundingClientRect();
  return {
    name: event.type,
    x: event.clientX - boundingClientRect.left,
    y: event.clientY - boundingClientRect.top,
    isCtrlDown: event.ctrlKey,
    isShiftDown: event.shiftKey,
  };
};

const adaptCanvasKeyboardEvent = ({ event }: { event: KeyboardEvent }): IKeyboardEvent => ({
  name: event.type,
  key: event.key,
  isCtrlDown: event.ctrlKey,
  isShiftDown: event.shiftKey,
});
