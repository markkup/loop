export interface IAppkitTracingConfig {
    keys?: string[];
}

export interface IAppkitConfig {
    platform: string;
    tracing?: IAppkitTracingConfig;
}

class Appkit {

    protected context: any;
    protected config: IAppkitConfig = {} as IAppkitConfig;

    public init(config: IAppkitConfig) {
        this.config = config;
    }

    public setContext(context: any) {
        this.context = context;
    }

    public get platform() {
        return this.config.platform;
    }

    public log(msg: string | object): void {
        if (this.context) {
            this.context.console.log(msg);
        }
    }

    public logError(e: any, info: string = ''): void {
        if (this.context) {
            const err = JSON.parse(JSON.stringify(e));
            this.context.console.log({
                info,
                message: err.message || err,
                stack: err.stack || '',
            });
        }
    }

    public get network() {
        return this.context.Network;
    }
}

export default new Appkit();
