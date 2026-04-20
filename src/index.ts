// Dependencies - Framework.
import type { ContextConfig, ContextInterface, ListContextOptions, ListContextResult } from '@dpuse/dpuse-shared/component/module/context';

// Context Core
import config from '~/config.json';

// Default Context Class ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default class DefaultContext implements ContextInterface {
    readonly config: ContextConfig;

    constructor() {
        this.config = config as ContextConfig;
    }

    // Operations - List.
    // TODO: Do we need context as first argument?
    // eslint-disable-next-line @typescript-eslint/require-await
    async listContextFocuses(context: ContextInterface, options?: ListContextOptions): Promise<ListContextResult> {
        return { models: this.config.models };
    }
}
