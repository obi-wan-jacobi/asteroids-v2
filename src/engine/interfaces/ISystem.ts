import IUnique from '../../framework/interfaces/IUnique';

export default interface ISystem extends IUnique {

    once(): void;

    draw(): void;

}
