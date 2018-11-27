export default interface IUser {
    allowAccess: boolean;
    allowNotifications: boolean;
    avatarUrl: string;
    bio: string;
    displayName: string;
    initials: string;
    lastAccessDate?: number;
    messageBadge?: number;
    permissions: string[];
    phone: string;
    phoneClean: string;
    role: string;
    token?: string;
    topicBadge?: number;
    uid: string;
}
