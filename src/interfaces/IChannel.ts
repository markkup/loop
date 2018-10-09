export default interface IChannel {
    lastMessage: {
        text: string;
        timestamp: number;
        uid: string;
    };
    users?: {
        [key: string]: boolean;
    };
    topicKey?: string;
}
