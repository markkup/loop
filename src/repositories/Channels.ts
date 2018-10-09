import { IChannel } from '../interfaces';
import Repository from './Repository';

class Channels extends Repository<IChannel> {

    constructor() {
        super('channels');
    }
}

export default Channels;
