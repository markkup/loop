// import fetch from './fetch';

export interface ITwilioConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string;
}

declare var Buffer: any;

export class Sms {

    protected config: ITwilioConfig = {} as ITwilioConfig;

    public init(config: ITwilioConfig) {
        this.config = config;
    }

    public async send(to: string, message: string): Promise<any> {
        let body = '';
        body += 'To=' + encodeURIComponent(to) + '&';
        body += 'From=' + encodeURIComponent(this.config.fromNumber) + '&';
        body += 'Body=' + encodeURIComponent(message);

        const authString = new Buffer(this.config.accountSid + ':' + this.config.authToken).toString('base64');
        const options = {
            method: 'POST',
            body,
            headers: {
                'Authorization': 'Basic ' + authString,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/SMS/Messages.json`;

        const res = await fetch(url, options);
        const json = await res.json();
        return json;
    }
}

export default new Sms();
