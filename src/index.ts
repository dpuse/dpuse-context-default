// Dependencies - Framework.
import type { Context, ContextConfig } from '@datapos/datapos-share-core';

// Dependencies - Data.
import config from '../config.json';
import data from './data.json';

// Constants

// Classes - File Store Emulator Connector
export default class FileStoreEmulatorConnector implements Context {
    readonly config: ContextConfig;

    constructor() {
        this.config = config as ContextConfig;
    }
}
