import { Component } from '@plasmastrapi/ecs';
import { THRUSTER_STATE } from 'app/enums/THRUSTER_STATE';

export default class ThrusterComponent extends Component<{
  state: THRUSTER_STATE;
  offset: { x: number };
  length: number;
  width: number;
  isCreateThrustStream: boolean;
}> {}
