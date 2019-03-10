import IEntity from './IEntity';
import IUnique from '../../framework/interfaces/IUnique';

export default interface ISystem extends IUnique {

    once(entity: IEntity): void;

}
