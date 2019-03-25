import { Component } from '../engine/Component';

export interface IPoint { x: number; y: number; }

export interface IPose { x: number; y: number; a: number; }
export class Pose extends Component<IPose> {}

export interface IShape { points: IPoint[]; rendering?: IRenderingProfile; }
export class Shape extends Component<IShape> {}

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
