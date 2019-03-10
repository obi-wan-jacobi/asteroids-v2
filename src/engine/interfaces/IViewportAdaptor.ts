import { ILabel, IPoint, IPose, IRenderProfile, IShape } from '../../app/components';

export default interface IViewportAdaptor {

    refresh(): void;

    drawLabel({ pose, label }: { pose: IPose, label: ILabel }): void;

    drawShape(shape: IShape): void;

    drawLine({ points, rendering }: { points: IPoint[], rendering: IRenderProfile }): void;

}
