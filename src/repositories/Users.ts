import { IUser } from '../interfaces';
import appkit from '../lib/appkit';
import Repository from './Repository';

class Users extends Repository<IUser> {

    public permissions: string[] = ['users', 'notify', 'develop'];
    public roles: string[] = ['admin', 'exec', 'mgr', 'rep'];
    public roleNames: string[] = ['Admin', 'Executive', 'Manager', 'Rep'];

    constructor() {
        super('users', 'uid');
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

    public cleanPhone(phone: string): string {
        if (!phone) {
            return '';
        }
        // remove + and/or 1 from beginning
        if (phone[0] === '+') {
            phone = phone.substring(1);
        }
        if (phone[0] === '1') {
            phone = phone.substring(1);
        }
        return phone.replace(/\D/g, '').substring(0, 10);
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

    public formatPhone(phone: string): string {
        phone = this.cleanPhone(phone);
        let num;
        if (phone.length < 3) {
            num = `(${phone}`;
        } else if (phone.length < 6) {
            num = `(${phone.substring(0, 3)}) ${phone.substring(3, 5)}`;
        } else {
            num = `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6, 10)}`;
        }
        return num;
    }

    public add(displayName: string, bio: string, phone: string): Promise<any> {
        try {
            const user = {
                phone,
                phoneClean: this.cleanPhone(phone),
                displayName,
                initials: this.getNameInitials(displayName),
                bio,
                allowAccess: true,
            };
            return this.insert(user, '');
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

    public async getByPhone(phone: string): Promise<IUser | null> {
        try {
            phone = this.cleanPhone(phone);
            const users = await this.getAllByChildValue('phoneClean', phone);
            if (users.length === 0) {
                return null;
            } else {
                return users[0];
            }
        } catch (e) {
            appkit.logError(e, 'Users.getByPhone');
            throw e;
        }
    }

    public getAllByDealership(dealershipId: string): Promise<IUser[]> {
        return this.getAllByChildValue('dealershipId', dealershipId);
    }
}

export default Users;
