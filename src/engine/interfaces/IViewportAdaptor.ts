import { ILabel, IPoint, IPose, IRenderingProfile, IShape } from '../../app/components';

export default interface IViewportAdaptor {

    refresh(): void;

    drawLabel({ pose, label }: { pose: IPose, label: ILabel }): void;

    drawShape({ shape, rendering }: { shape: IShape, rendering: IRenderingProfile }): void;

    drawLine({ points, rendering }: { points: IPoint[], rendering: IRenderingProfile }): void;

}
