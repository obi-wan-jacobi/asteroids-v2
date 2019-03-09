import IAdaptedMouseEvent from '../engine/interfaces/IAdaptedMouseEvent';
import { Component, Entity, Pose, Shape, ShapeBuilder } from './objects';

export interface IInteractive {
    click: (mouseEvent: IAdaptedMouseEvent) => void;
}
export class Interactive extends Component<IInteractive> {

    protected _clone(methods: IInteractive): IInteractive {
        return methods;
    }

}
export interface ILabel { text: string; offset: { x: number, y: number }; }
export class Label extends Component<ILabel> {}

export class Button extends Entity {

    constructor({ x, y, label }: { x: number, y: number, label: string }) {
        super(arguments[0]);
        this.add(Pose)({ x, y, a: 0 });
        this.add(Shape)(ShapeBuilder.rectangle({ width: 40, height: 20 }));
        this.add(Label)({ text: label, offset: { x: -15, y: 5 } });
        this.add(Interactive)({ click: () => undefined });
    }

    public onClick(onClick: (mouseEvent: IAdaptedMouseEvent) => void): void {
        this.mutate(Interactive)({ click: onClick });
    }

}
