import { ContextConfig, ContextInterface, ListContextOptions, ListContextResult } from '@dpuse/dpuse-shared/component/module/context';
export default class DefaultContext implements ContextInterface {
    readonly config: ContextConfig;
    constructor();
    listContextFocuses(context: ContextInterface, options?: ListContextOptions): Promise<ListContextResult>;
}
