import fs from 'fs/promises';
import { tabToJson } from './utilities.js';

async function transformLanguageData() {
    const languages = [];

    const geoNamesLanguageData = await fs.readFile('./helpers/data/downloads/geoNamesLanguages.tsv', 'utf8');
    const geoNamesLanguages = tabToJson(geoNamesLanguageData); // TODO: Do this as part of retrieval?

    for (const rec of geoNamesLanguages) {
        if (!rec['ISO 639-3']) {
            console.log('! Ignored blank ISO 639-3 code', `for ISO 639-2 code '${rec['ISO 639-2']}', name '${rec['Language Name']}'.`);
            continue;
        }
        const matches = rec['ISO 639-2'].match(/^(.+?)\s*\/\s*(.+?)\s*\*.*$/);
        if (matches) {
            console.log('! Unpacked ISO 639-2 code for ISO 639-3 code', `'${rec['ISO 639-3']}', from '${rec['ISO 639-2']}' to '${matches[2]}', name '${rec['Language Name']}'.`);
            languages.push({
                id: rec['ISO 639-3'], // Terminological code.
                idB: matches[2] || undefined, // Bibliographic code.
                id2: rec['ISO 639-1'] || undefined,
                label: { en: rec['Language Name'] }
            });
        } else {
            languages.push({
                id: rec['ISO 639-3'], // Terminological code.
                idB: rec['ISO 639-2'] || undefined, // Bibliographic code.
                id2: rec['ISO 639-1'] || undefined,
                label: { en: rec['Language Name'] }
            });
        }
    }

    await fs.writeFile('./helpers/data/perLanguages.json', JSON.stringify(languages, null, 4), 'utf-8');

    console.log('∑ Language count (ISO 639-3):', languages.length);
    console.log('∑ Language count (ISO 639-2):', languages.filter((l) => !!l.idB).length);
    console.log('∑ Language count (ISO 639-1):', languages.filter((l) => !!l.id2).length);
}

async function transformNationalityData() {
    const countryDataRestCountriesIndependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesIndependent.json', 'utf-8');
    const countriesRestCountriesIndependent = JSON.parse(countryDataRestCountriesIndependent);
    const countryDataRestCountriesDependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesDependent.json', 'utf-8');
    const countriesRestCountriesDependent = JSON.parse(countryDataRestCountriesDependent);
    const countries = [...countriesRestCountriesIndependent, ...countriesRestCountriesDependent];

    const nationalityMap = {};
    for (const country of countries) {
        for (const value of Object.values(country.demonyms.eng)) {
            if (value) nationalityMap[country.cca2] = { name: value };
        }
    }
    const nationalities = [];
    for (const [key, value] of Object.entries(nationalityMap)) {
        nationalities.push({ id: key.toLocaleLowerCase(), label: { en: value.name } });
    }
    await fs.writeFile('./helpers/data/perNationalities.json', JSON.stringify(nationalities, null, 4), 'utf-8');

    console.log('∑ Nationality count:', nationalities.length);
}

console.log('# Transforming Language Data...');
await transformLanguageData();

console.log('\n# Transforming Nationality Data...');
await transformNationalityData();
