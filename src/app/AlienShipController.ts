import Wrapper from '../framework/abstracts/Wrapper';
import { MissileLauncher, Velocity } from './components';
import { AlienShip } from './entities';

export default class AlienShipController extends Wrapper<AlienShip> {

    public engage(): void {
        this.__deek();
        this.__postpone(this.__loop, 100);
    }

    private __loop(): void {
        if (Math.random() >= 0.9) {
            this.__deek();
        }
        if (Math.random() >= 0.9) {
            this.__shoot();
        }
        this.__postpone(this.__loop, 100);
    }

    private __shoot(): void {
        const missileLauncher = this.unwrap().copy(MissileLauncher);
        missileLauncher.state = 'FIRE';
        this.unwrap().mutate(MissileLauncher)(missileLauncher);
    }

    private __deek(): void {
        this.unwrap().mutate(Velocity)({ x: 0.4 * (0.5 - Math.random()), y: 0.4 * (0.5 - Math.random()), w: 0 });
    }

    private __postpone(next: () => void, ms: number): void {
        if (!this.unwrap().isDestroyed) {
            setTimeout(next.bind(this), ms);
        }
    }

}
