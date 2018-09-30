import UserNotificationTokens from '../repositories/UserNotificationTokens';
import appkit from './appkit';
import firebase from './firebase';

export class Push {

    public async updateNotificationToken(uid: string, token: string) {
        try {
            uid = '' + uid;

            appkit.log({
                uid,
                token,
                platform: appkit.platform,
            });

            if (!uid) {
                throw new Error(`uid is required`);
            }

            if (!token) {
                throw new Error(`token is required`);
            }

            // on ios we need to convert it to an fcm token
            if (appkit.platform === 'ios') {
                const data = await firebase.fetchCloudFunction(`convertApnsToken?token=${token}`);
                token = data.token;
                if (!token) {
                    return;
                }
            }

            appkit.log(`token=${token}`);

            const userNotificationTokens = new UserNotificationTokens();
            const tokenUpdates = {} as any;

            // remove token from everywhere
            const userTokens = await userNotificationTokens.getAllRaw();
            Object.keys(userTokens).forEach(userTokenKey => {
                appkit.log(`userTokenKey=${userTokenKey}`);
                const userToken = userTokens[userTokenKey];
                Object.keys(userToken).forEach(tokenKey => {
                    appkit.log(`tokenKey=${tokenKey}`);
                    if (tokenKey === token) {
                        userToken[tokenKey] = null;
                        tokenUpdates[userTokenKey] = userToken;
                    }
                });
            });

            appkit.log(JSON.stringify(tokenUpdates));

            // add our new token
            if (tokenUpdates[uid] === undefined) {
                if (userTokens[uid] === undefined) {
                    tokenUpdates[uid] = {} as any;
                } else {
                    tokenUpdates[uid] = userTokens[uid];
                }
            }
            tokenUpdates[uid][token] = true;

            appkit.log(JSON.stringify(tokenUpdates));

            // commit updates
            await userNotificationTokens.updateAll(tokenUpdates);
        } catch (e) {
            appkit.logError(e, 'Push.updateNotificationToken error');
            throw e;
        }
    }
}

export default new Push();
