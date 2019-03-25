import Wrapper from '../framework/abstracts/Wrapper';
import { Acceleration, MissileLauncher, Thruster, Velocity } from './components';
import { Ship } from './entities';

export default class ShipController extends Wrapper<Ship> {

    public accelerate(): void {
        this.unwrap().mutate(Thruster)({ state: 'ACCELERATE' });
    }

    public idle(): void {
        const acceleration = this.unwrap().copy(Acceleration);
        acceleration.x = 0;
        acceleration.y = 0;
        this.unwrap().mutate(Acceleration)(acceleration);
        this.unwrap().mutate(Thruster)({ state: 'IDLE' });
    }

    public turnLeft(): void {
        const velocity = this.unwrap().copy(Velocity);
        velocity.w = -Math.PI / 512;
        this.unwrap().mutate(Velocity)(velocity);
    }

    public stopTurningLeft(): void {
        const velocity = this.unwrap().copy(Velocity);
        if (velocity.w < 0 ) {
            velocity.w = 0;
            this.unwrap().mutate(Velocity)(velocity);
        }
    }

    public turnRight(): void {
        const velocity = this.unwrap().copy(Velocity);
        velocity.w = Math.PI / 512;
        this.unwrap().mutate(Velocity)(velocity);
    }

    public stopTurningRight(): void {
        const velocity = this.unwrap().copy(Velocity);
        if (velocity.w > 0 ) {
            velocity.w = 0;
            this.unwrap().mutate(Velocity)(velocity);
        }
    }

    public shoot(): void {
        const missileLauncher = this.unwrap().copy(MissileLauncher);
        missileLauncher.state = 'FIRE';
        this.unwrap().mutate(MissileLauncher)(missileLauncher);
    }

}
