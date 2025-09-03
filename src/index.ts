// Dependencies - Framework.
import type { Context, ContextConfig, ContextFocusConfigListResult, ContextFocusConfigListSettings } from '@datapos/datapos-shared';
import config from '../config.json';

// Classes - Default context.
export default class DefaultContext implements Context {
    readonly config: ContextConfig;

    constructor() {
        this.config = config as ContextConfig;
    }

    // Operations - List focuses.
    async listFocuses(settings?: ContextFocusConfigListSettings): Promise<ContextFocusConfigListResult> {
        const focusConfigs = config.focuses;
        return { focusConfigs };
    }
}
