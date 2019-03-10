import ComponentIndex from './ComponentIndex';
import EntityFactory from './EntityFactory';
import Factory from '../framework/data-structures/Factory';
import IComponentIndex from './interfaces/IComponentIndex';
import IEntity from './interfaces/IEntity';
import { IEntityFactory } from './interfaces/IEntityFactory';
import ISystem from './interfaces/ISystem';
import IViewportAdaptor from './interfaces/IViewportAdaptor';

export default class Engine {

    public components: IComponentIndex;
    public entities: IEntityFactory;
    public systems: Factory<ISystem>;
    public drawSystems: Factory<ISystem>;

    constructor() {
        this.components = new ComponentIndex();
        this.entities = new EntityFactory(this.components);
        this.systems = new Factory<ISystem>();
        this.drawSystems = new Factory<ISystem>();
    }

    public once(): void {
        this.systems.forEach((system: ISystem) => {
            this.entities.forEach((entity: IEntity) => system.once(entity));
        });
    }

    public draw(viewport: IViewportAdaptor): void {
        this.drawSystems.forEach((system: ISystem) => {
            this.entities.forEach((entity: IEntity) => system.once(entity));
        });
    }
}
