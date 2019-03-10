import IComponent from '../interfaces/IComponent';
import IEntity from '../interfaces/IEntity';
import ISystem from '../interfaces/ISystem';
import Unique from '../../framework/abstracts/Unique';

export function OnlyIfEntityHas<T>(ComponentCtor: new (data: T) => IComponent<T>): any {
    return (target: ISystem, key: string, descriptor: PropertyDescriptor) => {
        const fn = descriptor.value;
        descriptor.value = function(entity: IEntity): void {
            if (!entity.copy(ComponentCtor)) {
                return;
            }
            fn.call(this, entity);
        };
    };
}

export abstract class System extends Unique implements ISystem {

    public abstract once(entity: IEntity): void;

}
