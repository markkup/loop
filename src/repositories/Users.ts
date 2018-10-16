import { IUser } from '../interfaces';
import appkit from '../lib/appkit';
import phones from '../lib/phones';
import Repository from './Repository';

class Users extends Repository<IUser> {

    public permissions: string[] = ['users', 'notify', 'develop'];
    public roles: string[] = ['admin', 'exec', 'mgr', 'rep'];
    public roleNames: string[] = ['Admin', 'Executive', 'Manager', 'Rep'];

    protected userCache: { [index: string]: IUser } = {};

    constructor() {
        super('users', 'uid');
    }

    public find(uid: string): Promise<IUser> {
        if (this.userCache[uid]) {
            return Promise.resolve(this.userCache[uid]);
        }
        return this.get(uid)
            .then(user => {
                this.userCache[uid] = user;
                return user;
            });
    }

    public getByPhone(phone: string): Promise<IUser | null> {
        const phoneClean = phones.clean(phone);
        return this.getByPhoneClean(phoneClean);
    }

    public async getByPhoneClean(phoneClean: string): Promise<IUser | null> {
        const results = await this.getAllByChildValue('phoneClean', phoneClean);
        if (results && results.length > 0) {
            return results[0];
        }
        return null;
    }

    public roleToDisplayName(role: string) {
        const index = this.roles.findIndex(r => r === role);
        if (index === -1) {
            return 'Unknown';
        }
        return this.roleNames[index];
    }

    public filterByPermission(users: any[], permission: string) {
        if (permission) {
            users = users.filter(user => {
                if (permission === ' ' && (!user.permissions || user.permissions.length === 0)) {
                    return true;
                } else if (permission && !user.permissions) {
                    return false;
                } else if (permission && user.permissions) {
                    return user.permissions.includes(permission);
                }
                return true;
            });
        }
        return users;
    }

    public getNameInitials(name: string): string {
        let initials = '';
        if (name) {
            const tokens = name.trim().split(' ');
            if (tokens.length > 0) {
                initials = tokens[0][0].toUpperCase();
                if (tokens.length > 1 && tokens[tokens.length - 1].length > 0) {
                    initials += tokens[tokens.length - 1][0].toUpperCase();
                }
            }
        }
        return initials;
    }

    public add(displayName: string, bio: string, phone: string): Promise<any> {
        try {
            const user = {
                phone,
                phoneClean: phones.clean(phone),
                displayName,
                initials: this.getNameInitials(displayName),
                bio,
                allowAccess: true,
            } as IUser;
            return this.insert(user);
        } catch (e) {
            appkit.logError(e);
            throw e;
        }
    }

    public async updateAvatar(uid: string, imageBlob: any): Promise<string | null> {
        const downloadUrl = await this.updateImage(uid, 'avatars', imageBlob);
        await this.update(uid, { avatarUrl: downloadUrl });
        return downloadUrl;
    }
}

export default Users;
