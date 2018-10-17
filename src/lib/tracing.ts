import { IAppkitTracingConfig } from './appkit';

export type TraceFunction = (...args: any[]) => void;

export class Tracing {

    protected keys: string[] = [];

    public init(config: IAppkitTracingConfig | undefined): void {
        this.keys = config && config.keys || [];
    }

    public with(key: string): TraceFunction {
        return (...args: any[]) => {
            if (this.keys.includes(key)) {
                console.log(args);
            }
        };
    }

}

export default new Tracing();
