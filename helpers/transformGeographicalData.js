import fs from 'fs/promises';
import geoDivisions from './data/geoDivisions.json' with { type: 'json' };
import geoSubDivisions from './data/geoSubDivisions.json' with { type: 'json' };
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

    const geoCountries = [];
    // const currencies = {};
    for (const country of countries) {
        const label = { en: country.name.common };
        const labelOfficial = { en: country.name.official };
        for (const [key, translation] of Object.entries(country.translations)) {
            const alpha2 = lookupLocaleCode(key);
            if (!alpha2) continue;
            label[alpha2] = translation.common;
            labelOfficial[alpha2] = translation.official;
        }
        const sortedLabel = Object.fromEntries(Object.entries(label).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
        const sortedLabelOfficial = Object.fromEntries(Object.entries(labelOfficial).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));

        const geoDivision = geoDivisions.find((geoDivision) => geoDivision.label.en === country.region);
        const geoSubDivision = geoSubDivisions.find((geoSubDivision) => geoSubDivision.label.en === country.subregion);

        // for (const [key, currency] of Object.entries(country.currencies || {})) currencies[key] = (currencies[key] || 0) + 1;

        for (const [key, translation] of Object.entries(country.translations)) {
            const localeCode = lookupLocaleCode(key);
            if (!localeCode) continue;
            label[localeCode] = translation.common;
            labelOfficial[localeCode] = translation.official;
        }

        geoCountries.push({
            id: String(country.cca2).toLocaleLowerCase('en'),
            label: sortedLabel,
            labelOfficial: sortedLabelOfficial,
            capitals: country.capital,
            continents: country.continents,
            currencies: country.currencies,
            independent: country.independent,
            divisionId: geoDivision.id,
            subDivisionId: geoSubDivision?.id
        });
        if (country.capital?.length > 1) console.log('MULTIPLE CAPITALS__:', country.name.common, ',', country.capital);
        if (country.continents.length > 1) console.log('MULTIPLE CONTINENTS:', country.name.common, ',', country.continents);
        if (Object.keys(country.currencies ?? {}).length > 1) console.log('MULTIPLE CURRENCIES:', country.name.common, ',', country.currencies);
    }
    await fs.writeFile('./helpers/data/geoCountries.json', JSON.stringify(geoCountries, null, 4), 'utf-8');

    // const sortedCurrencies = Object.fromEntries(Object.entries(currencies).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
    // console.log('CURRENCIES_________:', sortedCurrencies);
}

function lookupLocaleCode(key) {
    const alpha3BMatch = languages.find((item) => item['alpha3-b'] === key);
    if (alpha3BMatch) return alpha3BMatch.alpha2;

    const alpha3TMatch = languages.find((item) => item['alpha3-t'] === key);
    if (alpha3TMatch) return alpha3TMatch.alpha2;

    console.log('MISSING LOCALE_____:', key);
    return undefined;
}

async function transformTimeZoneData() {
    const timeZones = Intl.supportedValuesOf('timeZone').map((timeZoneName) => ({ name: timeZoneName }));
    timeZones.sort((left, right) => left.name.localeCompare(right.name));
    await fs.writeFile('./helpers/data/geoTimeZones.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

transformCountryData();
transformTimeZoneData();
