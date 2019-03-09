import ComponentIndex, { IComponentIndex } from './ComponentIndex';
import Container from '../framework/data-structures/Container';
import EntityIndex, { IEntityIndex } from './EntityIndex';
import IViewportAdaptor from './interfaces/IViewportAdaptor';
import { Entity } from '../app/objects';
import { System } from '../app/systems';

export default class Engine {

    public components: IComponentIndex;
    public entities: IEntityIndex;
    public systems: Container<System>;

    constructor() {
        this.components = new ComponentIndex();
        this.entities = new EntityIndex(this.components);
        this.systems = new Container<System>();
    }

    public once(): void {
        this.systems.forEach((system: System) => {
            this.entities.forEach((entity: Entity) => system.once(entity));
        });
    }

    public draw(viewport: IViewportAdaptor): void {
        this.entities.forEach((entity: Entity) => viewport.once(entity));
    }
}
