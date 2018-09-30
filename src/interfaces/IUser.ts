export default interface IUser {
    avatarUrl: string;
    bio: string;
    displayName: string;
    initials: string;
    role: string;
    uid: string;
    dealershipId: string;
    dealershipName: string;
    allowAccess: boolean;
    allowNotifications: boolean;
    permissions: string[];
    phone: string;
    phoneClean: string;
    token?: string;
}
