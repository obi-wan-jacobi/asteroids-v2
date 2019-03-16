import ComponentIndex from './ComponentIndex';
import EntityFactory from './EntityFactory';
import Factory from '../framework/data-structures/Factory';
import IComponentIndex from './interfaces/IComponentIndex';
import IEngine from './interfaces/IEngine';
import { IEntityFactory } from './interfaces/IEntityFactory';
import IFactory from '../framework/interfaces/IFactory';
import ISystem from './interfaces/ISystem';
import IViewportAdaptor from './interfaces/IViewportAdaptor';

export default class Engine implements IEngine {

    public viewport: IViewportAdaptor;
    public components: IComponentIndex;
    public entities: IEntityFactory;
    public systems: IFactory<ISystem>;

    constructor(viewport: IViewportAdaptor) {
        this.viewport = viewport;
        this.components = new ComponentIndex();
        this.entities = new EntityFactory(this);
        this.systems = new Factory<ISystem>();
    }

    public once(): void {
        this.systems.forEach((system: ISystem) => system.once());
    }

    public draw(): void {
        this.systems.forEach((system: ISystem) => system.draw());
    }
}
