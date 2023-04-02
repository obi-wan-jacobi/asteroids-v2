import IInputHandler from 'app/interfaces/IInputHandler';

export default abstract class InputHandler implements IInputHandler {
  [key: string]: any;

  public abstract init(args?: {}): void;

  public abstract dispose(): void;
}
