import { Component } from '@plasmastrapi/ecs';
import { MISSILE_LAUNCHER_STATE } from 'app/enums/MISSILE_LAUNCHER_STATE';

export default class MissileLauncherComponent extends Component<{
  state: MISSILE_LAUNCHER_STATE;
  cooldown: number;
  timer: number;
}> {}
