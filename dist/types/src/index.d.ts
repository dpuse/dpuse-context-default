import { Context, ContextConfig, ContextListOptions, ContextListResult } from '@dpuse/dpuse-shared';
export default class DefaultContext implements Context {
    readonly config: ContextConfig;
    constructor();
    listContextFocuses(options?: ContextListOptions): Promise<ContextListResult>;
}
