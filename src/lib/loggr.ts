export interface IEventOptions {
    user?: string;
    source?: string;
    tags?: string | string[];
    data?: string;
}

let currentUsername = '';
const setCurrentUsername = (username: string) => {
    currentUsername = username;
};

function getUser(): string {
    return currentUsername;
}

const writeEvent = (text: string, opts?: IEventOptions) => {
    const {
        user = getUser(),
        tags = '',
        source = '',
        data = '',
    } = opts || {};
    let params = `text=${encodeURIComponent(text)}&`;
    if (user) {
        params += `user=${encodeURIComponent(user)}&`;
    }
    if (tags) {
        if (Array.isArray(tags)) {
            params += `tags=${encodeURIComponent(tags.join(' '))}&`;
        } else {
            params += `tags=${encodeURIComponent(tags)}&`;
        }
    }
    if (source) {
        params += `source=${encodeURIComponent(source)}&`;
    }
    if (data) {
        params += `data=${encodeURIComponent(data)}&`;
    }
    params += `apikey=65e479d4ef044f069714fd049c551fc6`;

    fetch(`http://post.loggr.net/1/logs/testlog/events?${params}`);
};

const loggr = {
    writeEvent,
    setCurrentUsername,
};

export default loggr;
