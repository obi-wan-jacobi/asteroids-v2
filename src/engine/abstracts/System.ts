import IEngine from '../interfaces/IEngine';
import ISystem from '../interfaces/ISystem';
import Unique from '../../framework/abstracts/Unique';

export abstract class System extends Unique implements ISystem {

    public $: IEngine;

    constructor($: IEngine) {
        super();
        this.$ = $;
    }

    public once(): void { return; }

    public draw(): void { return; }

}
