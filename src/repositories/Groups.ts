import GroupTransformer from '../transformers/GroupTransformer';
import Repository from './Repository';

class Groups extends Repository {

    constructor() {
        super('groups', new GroupTransformer());
    }
}

export default Groups;
