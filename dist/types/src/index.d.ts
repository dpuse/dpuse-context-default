import { Context, ContextConfig, ContextListResult, ContextListSettings } from '@datapos/datapos-shared';
export default class DefaultContext implements Context {
    readonly config: ContextConfig;
    constructor();
    list(settings?: ContextListSettings): Promise<ContextListResult>;
}
