import IEntity from './IEntity';

export default interface IViewportAdaptor {
    refresh(): void;
    once(entity: IEntity): void;
}
