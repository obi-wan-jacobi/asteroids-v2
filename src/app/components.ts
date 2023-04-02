import { Component } from '@plasmastrapi/ecs';

export enum THRUSTER_STATE {
  ACCELERATE,
  IDLE,
}

export class ThrusterComponent extends Component<{
  state: THRUSTER_STATE;
  offset: { x: number };
  length: number;
  width: number;
  isCreateThrustStream: boolean;
}> {}

export class HullComponent extends Component<{}> {}

export class EphemeralComponent extends Component<{ remainingMs: number }> {}

export enum MISSILE_LAUNCHER_STATE {
  IDLE,
  FIRE,
}

export class MissileLauncherComponent extends Component<{
  state: MISSILE_LAUNCHER_STATE;
  cooldown: number;
  timer: number;
}> {}

export class BooleanAsteroidSubtractorComponent extends Component<{}> {}
