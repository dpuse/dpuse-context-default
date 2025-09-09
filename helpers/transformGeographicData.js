import fs from 'fs/promises';
import geoRegions from './data/geoRegions.json' with { type: 'json' };
import geoSubregions from './data/geoSubregions.json' with { type: 'json' };
import languages from './data/retrievals/language-codes-full.json' with { type: 'json' };

async function transformCountryData() {
    const countryDataIndependent = await fs.readFile('./helpers/data/retrievals/countryDataFromCountryRestIndependent.json', 'utf-8');
    const countriesIndependent = JSON.parse(countryDataIndependent);
    const countryDataDependent = await fs.readFile('./helpers/data/retrievals/countryDataFromCountryRestDependent.json', 'utf-8');
    const countriesDependent = JSON.parse(countryDataDependent);
    const countries = [...countriesIndependent, ...countriesDependent];
    countries.sort((left, right) => left.cca2.localeCompare(right.cca2));

    console.log('Country count (Independent):', countriesIndependent.length);
    console.log('Country count (Dependent)__:', countriesDependent.length);
    console.log('Country count______________:', countries.length);
    // console.log('\nFirst country______________:', countries[0]);
    console.log('\n');

    const nationalities = {};
    const translations = {};

    const geoCountries = [];
    // const currencies = {};
    for (const country of countries) {
        const label = { en: country.name.common };
        const sortedLabel = Object.fromEntries(Object.entries(label).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));

        const labelOfficial = { en: country.name.official };
        const sortedLabelOfficial = Object.fromEntries(Object.entries(labelOfficial).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));

        const geoRegion = geoRegions.find((geoRegion) => geoRegion.label.en === country.region);
        const geoSubregion = geoSubregions.find((geoSubregion) => geoSubregion.label.en === country.subregion);

        // for (const [key, currency] of Object.entries(country.currencies || {})) currencies[key] = (currencies[key] || 0) + 1;

        for (const value of Object.values(country.demonyms.eng || {})) {
            if (value) nationalities[country.cca2] = { label: { en: value } };
        }

        for (const key of Object.keys(country.translations || {})) translations[key] = { c: (translations[key]?.c || 0) + 1 };
        for (const [key, translation] of Object.entries(country.translations)) {
            const locale = lookupLanguageUsingAlpha3(key);
            if (!locale) continue;
            label[locale.alpha2] = translation.common;
            labelOfficial[locale.alpha2] = translation.official;
        }

        geoCountries.push({
            id: String(country.cca2).toLocaleLowerCase('en'),
            id3: String(country.cca3).toLocaleLowerCase('en'),
            idCIOC: String(country.cioc).toLocaleLowerCase('en'),
            idNum: String(country.ccn3),
            label: sortedLabel,
            labelOfficial: sortedLabelOfficial,
            capitals: country.capital,
            continents: country.continents,
            currencies: country.currencies,
            independent: country.independent,
            regionId: geoRegion.id,
            subregionId: geoSubregion?.id
        });

        if (country.capital?.length > 1) console.log('! Multiple capitals________:', country.name.common, '-', country.capital);
        if (country.continents.length > 1) console.log('! Multiple continents______:', country.name.common, '-', country.continents);
        if (Object.keys(country.currencies ?? {}).length > 1) console.log('! Multiple currencies______:', country.name.common);
    }

    await fs.writeFile('./helpers/data/geoCountries.json', JSON.stringify(geoCountries, null, 4), 'utf-8');

    // const sortedCurrencies = Object.fromEntries(Object.entries(currencies).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
    // console.log('CURRENCIES_________:', sortedCurrencies);

    console.log('\nNationalities______________:', nationalities);

    const geoLanguages = [];
    for (const language of languages) {
        geoLanguages.push({ id: language['alpha3-b'], idT: language['alpha3-t'] || undefined, id2: language.alpha2 || undefined, label: { en: language.English } });
    }

    for (const [key, value] of Object.entries(translations || {})) {
        value.id2 = lookupLanguageUsingAlpha3(key)?.alpha2 || null;
        value.idB = lookupLanguageUsingAlpha3(key)?.['alpha3-b'] || null;
        value.idT = lookupLanguageUsingAlpha3(key)?.['alpha3-t'] || '';
        value.l = lookupLanguageUsingAlpha3(key)?.English || null;
    }
    const sortedTranslations = Object.fromEntries(Object.entries(translations).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
    console.log('\nTranslations_______________:', sortedTranslations);

    await fs.writeFile('./helpers/data/geoLanguages.json', JSON.stringify(geoLanguages, null, 4), 'utf-8');
}

function lookupLanguageUsingAlpha3(code) {
    const alpha3BMatch = languages.find((item) => item['alpha3-b'] === code);
    if (alpha3BMatch) return alpha3BMatch;

    const alpha3TMatch = languages.find((item) => item['alpha3-t'] === code);
    if (alpha3TMatch) return alpha3TMatch;

    console.log('! Missing Locale___________:', code);
    return undefined;
}

async function transformTimeZoneData() {
    const timeZones = Intl.supportedValuesOf('timeZone').map((timeZoneName) => ({ name: timeZoneName }));
    timeZones.sort((left, right) => left.name.localeCompare(right.name));
    await fs.writeFile('./helpers/data/geoTimeZones.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

transformCountryData();
transformTimeZoneData();
