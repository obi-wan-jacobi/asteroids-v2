import { Component } from '../engine/Component';

export interface IPoint { x: number; y: number; }
export class Point extends Component<IPoint> {}

export interface IPose { x: number; y: number; a: number; }
export class Pose extends Component<IPose> {}

export interface IShape { points: IPoint[]; rendering?: IRenderingProfile; }
export class Shape extends Component<IShape> {}

export interface IMinMaxBoundary2D {
    minX: number; maxX: number; minY: number; maxY: number;
}
export class MinMaxBoundary2D extends Component<IMinMaxBoundary2D> {}

export class ShapeBuilder {

    public static rectangle({ width, height }: { width: number, height: number }): IShape {
        return {
            points: [
                { x: width / 2, y: - height / 2 },
                { x: - width / 2, y: - height / 2 },
                { x: - width / 2, y: height / 2 },
                { x: width / 2, y: height / 2 },
            ],
        };
    }

}

export class Velocity extends Component<{ x: number; y: number; w: number; }> {}

export class Acceleration extends Component<{ x: number; y: number; w: number; }> {}

export class Thruster extends Component<{ state: string }> {}

export class Hull extends Component<{}> {}

export class Ephemeral extends Component<{ remaining: number }> {}

export class MissileLauncher extends Component<{ state: string, cooldown: number, timer: number }> {}

export interface ILabel { text: string; fontSize: number; offset: { x: number, y: number }; }
export class Label extends Component<ILabel> {}

export class Flair extends Component<{ offset: { x: number }, length: number, width: number }> {}

export interface IRenderingProfile {

    colour: string;

}
export class RenderingProfile extends Component<IRenderingProfile> {}

export class BooleanAsteroidSubtractor extends Component<{}> {}
