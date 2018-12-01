import { IModelTransformer, IUser } from '../interfaces';

export default class UserTransformer implements IModelTransformer<IUser> {

    public transform(data: any): IUser {
        return {
            allowAccess: data.allowAccess === true,
            allowNotifications: data.allowNotifications === true,
            avatarUrl: data.avatarUrl || '',
            bio: data.bio || '',
            displayName: data.displayName || '',
            initials: data.initials || '',
            lastAccessDate: data.lastAccessDate || 0,
            messageBadge: data.messageBadge || 0,
            permissions: data.permissions || '',
            phone: data.phone || '',
            phoneClean: data.phoneClean || '',
            role: data.role || '',
            token: data.token || '',
            topicBadge: data.topicBadge || 0,
            uid: data.uid || '',
        };
    }
}
