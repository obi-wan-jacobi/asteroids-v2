import { IComponentMaster } from '@plasmastrapi/ecs';
import { IViewport, RenderingSystem } from '@plasmastrapi/engine';
import { PoseComponent, transformShape } from '@plasmastrapi/geometry';
import { AccelerationComponent } from '@plasmastrapi/physics';
import { COLOUR } from '@plasmastrapi/presentation';
import { THRUSTER_STATE, ThrusterComponent } from 'app/components';
import { ThrustStream } from 'app/entities';

export default class ThrusterSystem extends RenderingSystem {
  public once({ components }: { components: IComponentMaster }): void {
    components.forEvery(ThrusterComponent)((component) => {
      const thruster = component.copy();
      if (thruster.state !== THRUSTER_STATE.ACCELERATE) {
        return;
      }
      const entity = component.$entity;
      const factor = 0.0003;
      const pose = entity.$copy(PoseComponent)!;
      if (entity.$has(AccelerationComponent)) {
        const acceleration = entity.$copy(AccelerationComponent)!;
        acceleration.x = factor * Math.cos(pose.a);
        acceleration.y = factor * Math.sin(pose.a);
        entity.$patch(AccelerationComponent, acceleration);
      }
      if (thruster.isCreateThrustStream) {
        new ThrustStream({
          pose,
          offset: thruster.offset,
          width: thruster.width,
          length: thruster.length,
        });
      }
    });
  }

  public draw({ viewport, components }: { viewport: IViewport<any>; components: IComponentMaster }): void {
    components.forEvery(ThrusterComponent)((component) => {
      const thruster = component.copy();
      if (thruster.state !== THRUSTER_STATE.ACCELERATE) {
        return;
      }
      const pose = component.$entity.$copy(PoseComponent)!;
      const flairShape = {
        vertices: [
          { x: thruster.offset.x, y: -thruster.width / 2 },
          { x: -thruster.length, y: 0 },
          { x: thruster.offset.x, y: thruster.width / 2 },
        ],
      };
      const transform = transformShape(flairShape, pose);
      viewport.drawLine({
        path: transform.vertices,
        style: { colour: COLOUR.RGBA_RED, fill: COLOUR.RGBA_0, opacity: 1, zIndex: 0 },
      });
    });
  }
}
