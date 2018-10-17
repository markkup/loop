import Loop from '..';
import { IUser } from '../interfaces';
import appkit from './appkit';
import tracing from './tracing';

const trace = tracing.with('profile');

export type ProfileWatchFunction = (err: Error | undefined, valid: boolean, user: IUser | null) => void;

export interface IProfileWatch {
    remove: () => void;
    listener: ProfileWatchFunction;
}

export class Profile {

    protected profileListener: ProfileWatchFunction | null = null;
    protected currentUser: IUser | null = null;
    protected changeListener: any = null;

    public watch(user: IUser, listener: ProfileWatchFunction): IProfileWatch | null {

        if (this.profileListener) {
            listener(new Error('profile listener is already set, remove it first'), false, null);
            return null;
        }

        this.profileListener = listener;
        this.currentUser = user;

        // listen for network changes
        appkit.network.addEventListener('change', this.networkChanged.bind(this));

        // validate profile changes
        this.validateProfileState();

        return {
            remove: () => {
                this.profileListener = null;
                this.clearChangeListener();
                appkit.network.removeEventListener('change', this.networkChanged.bind(this));
            },
            listener,
        };
    }

    public async login(code: string): Promise<IUser> {
        const user = await Loop.auth.signIn(code);
        this.currentUser = user;
        return user;
    }

    public async logout(): Promise<void> {
        await Loop.auth.signOut();
        this.currentUser = null;
        if (this.profileListener) {
            this.profileListener(undefined, true, null);
        }
    }

    protected async validateProfileState() {
        if (appkit.network.connectionState === 'on' && this.currentUser) {
            const user = await this.ensureLoggedIn();
            if (!user) {
                trace('ensureLogin failed');
                if (this.profileListener) {
                    this.profileListener(new Error('You do not have permission to sign into this app'), false, null);
                }
                // app should logout here
            }
            this.setChangeListener();
        }
    }

    protected async ensureLoggedIn(): Promise<IUser | null> {
        if (!this.currentUser || !this.currentUser.token) {
            return null;
        }
        try {
            return await Loop.auth.ensureSignIn(this.currentUser.phone, this.currentUser.token);
        } catch (e) {
            appkit.logError(e, 'ensureLoggedIn');
        }
        return null;
    }

    protected networkChanged(connectionState: string) {

        trace('network changed ' + connectionState);

        if (connectionState === 'on') {
            this.validateProfileState();
        }
    }

    protected setChangeListener() {
        this.clearChangeListener();
        if (this.currentUser) {
            this.changeListener = Loop.users.watch(this.currentUser.uid, user => {
                if (user) {
                    trace(`profile changed: ${user.uid}`);
                    if (this.profileListener) {
                        this.profileListener(undefined, true, user);
                    }
                    this.currentUser = user;
                }
            });
            trace(`profile change listener created: ${this.currentUser.uid}`);
        }
    }

    protected clearChangeListener() {
        if (this.changeListener) {
            this.changeListener.remove();
            this.changeListener = null;
            trace('profile change listener cleared');
        }
    }
}

export default new Profile();
