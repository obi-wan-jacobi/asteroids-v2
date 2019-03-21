import IComponentIndex from './IComponentIndex';
import { IEntityFactory } from './IEntityFactory';
import ISystem from './ISystem';
import IViewportAdaptor from './IViewportAdaptor';
import { Ctor } from '../../framework/types';

export default interface IEngine {

    viewport: IViewportAdaptor;
    components: IComponentIndex;
    entities: IEntityFactory;

    delta: number;

    once(): void;
    draw(): void;
    add(SystemCtor: Ctor<ISystem, any>): void;
}
