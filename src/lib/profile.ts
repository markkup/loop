import { EventEmitter } from 'events';

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
    protected eventEmitter = new EventEmitter();
    protected validating: boolean = false;

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
                appkit.network.removeEventListener('change', this.networkChanged.bind(this));
                this.clearChangeListener();
                this.profileListener = null;
            },
            listener,
        };
    }

    public async login(code: string): Promise<IUser> {
        trace(`login: ${code}`);
        const user = await Loop.auth.signIn(code);
        this.currentUser = user;
        this.fireLoginStateChanged(user);
        if (this.profileListener) {
            this.profileListener(undefined, true, user);
        }
        return user;
    }

    public async logout(): Promise<void> {
        trace(`logout`);
        await Loop.auth.signOut();
        this.currentUser = null;
        this.fireLoginStateChanged(null);
        if (this.profileListener) {
            this.profileListener(undefined, true, null);
        }
    }

    public get user(): IUser | null {
        return this.currentUser;
    }

    public on(event: string, cb: any) {
        this.eventEmitter.on(event, cb);
    }

    protected fireLoginStateChanged(user: IUser | null): void {
        trace(`login state changed: ${user ? '' : 'NOT'} logged in`);
        this.eventEmitter.emit('login-changed', user);
    }

    protected async validateProfileState() {
        trace(`validateProfileState: this.validating=${this.validating}`);
        trace({ currentUser: this.currentUser });

        if (this.validating) {
            trace('already validating');
            return;
        }

        try {
            trace(`validating set to true`);
            this.validating = true;

            if (appkit.network.connectionState === 'on' && this.currentUser) {
                const user = await this.ensureLoggedIn();
                if (!user) {
                    trace('ensureLoggedIn failed');
                    if (this.profileListener) {
                        this.profileListener(
                            new Error('You do not have permission to sign into this app'),
                            false,
                            null,
                        );
                    }
                    // app should logout here
                }
                this.setChangeListener();
            }
        } finally {
            trace(`validating reset to false`);
            this.validating = false;
        }
    }

    protected async ensureLoggedIn(): Promise<IUser | null> {
        if (!this.currentUser || !this.currentUser.token) {
            trace(`ensureLoggedIn, no currentUser token: ${this.currentUser && this.currentUser.token}`);
            this.fireLoginStateChanged(null);
            return null;
        }

        let user: IUser | null = null;
        try {
            trace(`ensureLoggedIn calling ensureSignIn`);
            user = await Loop.auth.ensureSignIn(this.currentUser.phone, this.currentUser.token);
        } catch (e) {
            appkit.logError(e, 'ensureLoggedIn');
        }

        trace(user ? 'ensureLoggedIn got user' : 'ensureLoggedIn got null');
        this.fireLoginStateChanged(user);
        return user;
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
                    trace(`changed: ${user.uid}`);
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
