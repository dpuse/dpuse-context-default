/*
 * Default context class.
 */

// Dependencies - Framework.
import config from '~/config.json';
import type { Context, ContextConfig, ContextListResult, ContextListSettings } from '@dpuse/dpuse-shared';

// Classes - Default context.
export default class DefaultContext implements Context {
    readonly config: ContextConfig;

    constructor() {
        this.config = config as ContextConfig;
    }

    // Operations - List.
    async list(settings?: ContextListSettings): Promise<ContextListResult> {
        return { models: this.config.models };
    }
}
