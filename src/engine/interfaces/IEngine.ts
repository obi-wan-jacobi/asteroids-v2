import IComponentIndex from './IComponentIndex';
import { IEntityFactory } from './IEntityFactory';
import IFactory from '../../framework/interfaces/IFactory';
import ISystem from './ISystem';
import IViewportAdaptor from './IViewportAdaptor';

export default interface IEngine {

    viewport: IViewportAdaptor;
    components: IComponentIndex;
    entities: IEntityFactory;
    systems: IFactory<ISystem>;

    once(): void;
    draw(): void;
}
