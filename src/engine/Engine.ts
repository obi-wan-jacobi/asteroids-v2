import ComponentIndex from './ComponentIndex';
import EntityFactory from './EntityFactory';
import Factory from '../framework/data-structures/Factory';
import IComponentIndex from './interfaces/IComponentIndex';
import IEngine from './interfaces/IEngine';
import { IEntityFactory } from './interfaces/IEntityFactory';
import IFactory from '../framework/interfaces/IFactory';
import ISystem from './interfaces/ISystem';
import IViewportAdaptor from './interfaces/IViewportAdaptor';
import { Ctor } from '../framework/types';

export default class Engine implements IEngine {

    public viewport: IViewportAdaptor;
    public components: IComponentIndex;
    public entities: IEntityFactory;

    public delta: number;

    private __t: Date;
    private __systems: IFactory<ISystem>;

    constructor(viewport: IViewportAdaptor) {
        this.viewport = viewport;
        this.components = new ComponentIndex();
        this.entities = new EntityFactory(this);
        this.__systems = new Factory<ISystem>();
        this.__t = new Date();
    }

    public once(): void {
        const now = new Date();
        this.delta = now.getTime() - this.__t.getTime();
        this.__t = now;
        this.__systems.forEach((system: ISystem) => system.once());
    }

    public draw(): void {
        this.__systems.forEach((system: ISystem) => system.draw());
    }

    public add(SystemCtor: Ctor<ISystem, any>): void {
        this.__systems.add(SystemCtor, this);
    }

}
