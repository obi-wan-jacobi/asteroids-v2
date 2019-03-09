import IComponent from '../engine/interfaces/IComponent';
import IEntity from '../engine/interfaces/IEntity';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';
import { transformShape } from '../app/geometry';
import { Entity, Pose, Shape } from '../app/objects';
import { Label } from '../app/ui';

function DrawOnlyIfEntityHas(Components: Array<new (data: any) => IComponent<any>>): any {
    return function(target: HTML5CanvasViewportAdaptor, key: string, descriptor: PropertyDescriptor): void {
        const method = descriptor.value;
        const once = HTML5CanvasViewportAdaptor.prototype.once;
        HTML5CanvasViewportAdaptor.prototype.once = function(entity: IEntity): void {
            if (Components.filter((Component) => !entity.copy(Component)).length === 0) {
                method.call(this, entity);
            }
            once.call(this, entity);
        };
    };
}

function Atomic(target: HTML5CanvasViewportAdaptor, key: string, descriptor: PropertyDescriptor): void {
    const method = descriptor.value;
    descriptor.value = function(entity: IEntity): void {
        this.ctx.save();
        method.call(this, entity);
        this.ctx.restore();
    };
}

export class HTML5CanvasViewportAdaptor implements IViewportAdaptor {

    public ctx: CanvasRenderingContext2D;
    public width: number;
    public height: number;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
    }

    public refresh(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    public once(entity: IEntity): void {
        return;
    }

    @DrawOnlyIfEntityHas([Shape, Pose])
    @Atomic
    public drawShape(entity: Entity): void {
        const transform = transformShape({ shape: entity.copy(Shape), pose: entity.copy(Pose) });
        this.ctx.strokeStyle = 'white';
        this.ctx.beginPath();
        transform.points.forEach((p) => {
            this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.closePath();
        this.ctx.stroke();
    }

    @DrawOnlyIfEntityHas([Label, Pose])
    @Atomic
    public drawLabel(entity: IEntity): void {
        const pose = entity.copy(Pose);
        const label = entity.copy(Label);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(label.text, pose.x + label.offset.x, pose.y + label.offset.y);
    }

}
