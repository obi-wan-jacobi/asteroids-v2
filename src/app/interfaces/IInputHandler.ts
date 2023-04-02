import { IDisposable, Index, Void } from '@plasmastrapi/base';

export default interface IInputHandler extends IDisposable, Index<Void<any>> {
  init(args?: {}): void;
  dispose(): void;
}
