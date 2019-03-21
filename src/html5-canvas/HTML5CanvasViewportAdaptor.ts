import IEntity from '../engine/interfaces/IEntity';
import IViewportAdaptor from '../engine/interfaces/IViewportAdaptor';
import { ILabel, IPoint, IPose, IRenderingProfile, IShape } from '../app/components';

function Atomic(target: HTML5CanvasViewportAdaptor, key: string, descriptor: PropertyDescriptor): void {
    const fn = descriptor.value;
    descriptor.value = function(entity: IEntity): void {
        this.ctx.save();
        fn.call(this, entity);
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

    @Atomic
    public drawShape({ shape, rendering }: { shape: IShape, rendering: IRenderingProfile }): void {
        this.ctx.strokeStyle = rendering.colour;
        this.ctx.beginPath();
        shape.points.forEach((p: IPoint) => {
            this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.closePath();
        this.ctx.stroke();
    }

    @Atomic
    public drawLine({ points, rendering }: { points: IPoint[], rendering: IRenderingProfile }): void {
        this.ctx.strokeStyle = rendering.colour;
        this.ctx.beginPath();
        points.forEach((p: IPoint) => {
            this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.stroke();
    }

    @Atomic
    public drawLabel({ pose, label }: { pose: IPose, label: ILabel }): void {
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${label.fontSize}px Arial`;
        this.ctx.fillText(label.text, pose.x + label.offset.x, pose.y + label.offset.y);
    }

    @Atomic
    public drawPoint({ point }: { point: IPoint }): void {
        this.ctx.fillStyle = 'magenta';
        this.ctx.fillRect(point.x, point.y, 4, 4);
    }

}
