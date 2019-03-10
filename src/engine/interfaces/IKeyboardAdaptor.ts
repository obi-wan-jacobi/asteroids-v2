import IKeyboardHandler from './IKeyboardHandler';

export default interface IKeyboardAdaptor {
    once(): void;
    handler(handler: IKeyboardHandler): void;
}
