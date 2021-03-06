import { CustomerState } from './enums/CustomerState';
import { CustomerStatus } from './enums/CustomerStatus';
import { IChannel, ICustomer, IFirebaseConfig, IGroup, ILastMessage, IUser } from './interfaces';
import appkit, { IAppkitConfig } from './lib/appkit';
import auth from './lib/auth';
import connections from './lib/connections';
import datetime from './lib/datetime';
import firebase from './lib/firebase';
import loggr from './lib/loggr';
import phones from './lib/phones';
import profile from './lib/profile';
import push from './lib/push';
import sms, { ITwilioConfig } from './lib/sms';
import tracing from './lib/tracing';
import Channels from './repositories/Channels';
import CustomerMessages from './repositories/CustomerMessages';
import Customers from './repositories/Customers';
import Topics from './repositories/Topics';
import UserNotificationTokens from './repositories/UserNotificationTokens';
import Users from './repositories/Users';
import UserTopics from './repositories/UserTopics';

export interface IConfig {
    appkit: IAppkitConfig;
    firebase: IFirebaseConfig;
    twilio: ITwilioConfig;
}

export {
    CustomerState,
    CustomerStatus,
    ICustomer,
    IChannel,
    IGroup,
    ILastMessage,
    IUser,
};

export class Loop {

    public readonly firebase = firebase;
    public readonly datetime = datetime;
    public readonly phones = phones;
    public readonly auth = auth;
    public readonly push = push;
    public readonly sms = sms;
    public readonly profile = profile;
    public readonly connections = connections;
    public readonly loggr = loggr;

    // repositories
    public readonly users = new Users();
    public readonly channels = new Channels();
    public readonly topics = new Topics();
    public readonly userTopics = new UserTopics();
    public readonly userNotificationTokens = new UserNotificationTokens();
    public readonly customers = new Customers();
    public readonly customerMessages = new CustomerMessages();

    protected loopconfig: IConfig | null = null;

    public get config(): IConfig | null {
        return this.loopconfig;
    }

    public init(config: IConfig) {
        firebase.init(config.firebase);
        appkit.init(config.appkit);
        tracing.init(config.appkit.tracing);
        connections.init();
        sms.init(config.twilio);
        this.loopconfig = config;
    }

    public setAppkitContext(appkitContext: any) {
        appkit.setContext(appkitContext);
    }

}

export default new Loop();
