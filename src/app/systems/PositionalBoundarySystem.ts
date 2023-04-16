import { IComponentMaster, PoseComponent, System } from '@plasmastrapi/ecs';

export default class PositionalBoundarySystem extends System {
  public once({
    components,
    viewport,
  }: {
    components: IComponentMaster;
    viewport: { width: number; height: number };
  }): void {
    components.forEvery(PoseComponent)((component) => {
      let { x, y } = component.$entity.$copy(PoseComponent);
      const minX = 0,
        minY = 0;
      const { width: maxX, height: maxY } = viewport;
      if (x < minX) {
        x = maxX;
      }
      if (x > maxX) {
        x = minX;
      }
      if (y < minY) {
        y = maxY;
      }
      if (y > maxY) {
        y = minY;
      }
      component.$entity.$patch(PoseComponent, { x, y });
    });
  }
}
