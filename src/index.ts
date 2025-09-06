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
        return { focusConfigs: this.config.focuses };
    }

    // Operations
    async listModels() {}

    // Operations
    async listDimensions() {}

    // Operations
    async listEntities() {}

    // Operations
    async retrieveModel() {}

    // Operations
    async retrieveDimension() {}

    // Operations
    async retrieveEntity() {}
}

export async function retrieveCountries() {
    console.log(1111, 1234);
    return;
    // const headersList = {};

    // const response = await fetch(`https://api.countrylayer.com/v2/all?access_key=${import.meta.env.VITE_COUNRTYLAYER_ACCESS_KEY}`, {
    //     method: 'GET',
    //     headers: headersList
    // });

    // const data = await response.text();
    // console.log(data);
}

export function retrieveLanguages() {}

export function retrieveNationalities() {}
