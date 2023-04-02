import { IPose, PoseComponent } from '@plasmastrapi/geometry';
import { HTML5CanvasElement } from '@plasmastrapi/html5-canvas';

export default abstract class BaseEntity extends HTML5CanvasElement {
  public constructor({ pose }: { pose: IPose }) {
    super();
    this.$patch(PoseComponent, pose);
  }
}
