// Dependencies - Framework.
import type { Context, ContextConfig, ContextListOptions, ContextListResult } from '@dpuse/dpuse-shared';

// Context Core
import config from '~/config.json';

// Default Context Class ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default class DefaultContext implements Context {
    readonly config: ContextConfig;

    constructor() {
        this.config = config as ContextConfig;
    }

    // Operations - List.
    // eslint-disable-next-line @typescript-eslint/require-await
    async listContextFocuses(options?: ContextListOptions): Promise<ContextListResult> {
        return { models: this.config.models };
    }
}
