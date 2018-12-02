import { EventEmitter } from 'events';

import { IGroup, IUser } from '../interfaces';
import Groups from '../repositories/Groups';
import UserConnections from '../repositories/UserConnections';
import Users from '../repositories/Users';
import { IRecordWatch } from './firebase/FirebaseRepository';
import profile from './profile';
import tracing from './tracing';

const trace = tracing.with('connections');

export type ConnectionsWatchFunction = (connections: Connections) => void;

export interface IConnectionsWatch {
    remove: () => void;
    listener: ConnectionsWatchFunction;
}

export class Connections {

    protected connectionsListener: IRecordWatch | null = null;
    protected rawConnections = null;
    protected friendsArray: string[] = [];
    protected groupsArray: IGroup[] = [];
    protected userCache: { [index: string]: IUser | null } = {};
    protected eventEmitter = new EventEmitter();
    protected connectionsValid: boolean = false;

    public init() {
        trace('connections initialized');

        // listen for profile changes
        profile.on('login-changed', (user: IUser) => {
            trace(`profile login-changed: ${user && user.uid}`);

            this.clearConnectionListener();
            if (user) {
                trace('creating connection listener');

                const userConnectionsRepo = new UserConnections();
                this.connectionsListener = userConnectionsRepo.watch(user.uid, async (connections) => {
                    trace(`connections updated`);

                    this.rawConnections = connections;
                    if (connections && connections.friends) {
                        this.friendsArray = Object.keys(connections.friends).map(uid => uid);
                    }
                    this.groupsArray = [];
                    if (connections && connections.groups) {
                        for (const key in connections.groups) {
                            if (key) {
                                trace(`found group ${key}`);
                                const groupsRepo = new Groups();
                                const group = await groupsRepo.get(key);
                                if (group) {
                                    // transform group
                                    this.groupsArray.push({
                                        key: group.key,
                                        displayName: group.displayName,
                                        users: Object.keys(group.users).map(uid => uid),
                                    });
                                }
                            }
                        }
                    }
                });

                this.connectionsValid = true;
                this.eventEmitter.emit('changed');
            } else {
                this.connectionsValid = false;
            }
        });
    }

    public watch(listener: ConnectionsWatchFunction): IConnectionsWatch {

        // setup listener
        const watchListener = () => {
            if (listener) {
                listener(this);
            }
        };
        this.eventEmitter.on('changed', watchListener);

        // if this was called and our connections are already valid
        // then make an initial call of the listener
        if (this.connectionsValid && listener) {
            listener(this);
        }

        const base = this;
        return {
            remove: () => {
                base.eventEmitter.off('changed', watchListener);
            },
            listener,
        };
    }

    public get friends(): string[] {
        return this.friendsArray;
    }

    public get groups(): IGroup[] {
        return this.groupsArray;
    }

    public async findUser(uid: string): Promise<IUser | null> {
        if (this.userCache[uid]) {
            return Promise.resolve(this.userCache[uid]);
        }
        const usersRepo = new Users();
        return usersRepo.get(uid)
            .then(user => {
                if (user) {
                    this.userCache[uid] = user;
                }
                return user;
            });
    }

    public findGroup(key: string): IGroup | null {
        if (this.groupsArray) {
            return this.groupsArray.find(g => g.key === key) || null;
        }
        return null;
    }

    protected clearConnectionListener(): void {
        if (this.connectionsListener) {
            this.connectionsListener.remove();
            this.connectionsListener = null;
        }
    }
}

export default new Connections();
