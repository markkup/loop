import { IGroup, IModelTransformer } from '../interfaces';

export default class GroupTransformer implements IModelTransformer<IGroup> {

    public transform(data: any): IGroup {
        return {
            displayName: data.displayName || '',
            key: data.key || '',
            users: data.users || [],
        };
    }
}
