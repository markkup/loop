import { IGroup, IUser } from '../interfaces';
import Groups from '../repositories/Groups';
import UserConnections from '../repositories/UserConnections';
import Users from '../repositories/Users';
import { IRecordWatch } from './firebase/FirebaseRepository';
import profile from './profile';
import tracing from './tracing';

const trace = tracing.with('connections');

export class Connections {

    protected connectionsListener: IRecordWatch | null = null;
    protected rawConnections = null;
    protected friendsArray: string[] = [];
    protected groupsArray: IGroup[] = [];
    protected userCache: { [index: string]: IUser | null } = {};

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
                    if (connections.friends) {
                        this.friendsArray = Object.keys(connections.friends).map(uid => uid);
                    }
                    this.groupsArray = [];
                    if (connections.groups) {
                        for (const key in connections.group) {
                            if (key) {
                                const groupsRepo = new Groups();
                                const group = await groupsRepo.get(key);
                                if (group) {
                                    this.groupsArray.push(group);
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    public get friends() {
        return this.friendsArray;
    }

    public get groups() {
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
