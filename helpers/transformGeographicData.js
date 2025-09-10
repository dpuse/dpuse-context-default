import fs from 'fs/promises';
import geoRegions from './data/geoRegions.json' with { type: 'json' };
import geoSubregions from './data/geoSubregions.json' with { type: 'json' };

async function transformCountryData() {
    const countryDataRestCountriesIndependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesIndependent.json', 'utf-8');
    const countriesRestCountriesIndependent = JSON.parse(countryDataRestCountriesIndependent);
    const countryDataRestCountriesDependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesDependent.json', 'utf-8');
    const countriesRestCountriesDependent = JSON.parse(countryDataRestCountriesDependent);
    const countries = [...countriesRestCountriesIndependent, ...countriesRestCountriesDependent];
    countries.sort((left, right) => left.cca2.localeCompare(right.cca2));

    const countryDataGeoNames = await fs.readFile('./helpers/data/retrievals/countriesFromGeoNamesPostalCodeCountryInfo.json', 'utf-8');
    const countriesGeoNames = JSON.parse(countryDataGeoNames).geonames;

    console.log('Country count (Rest Countries Independent):', countriesRestCountriesIndependent.length);
    console.log('Country count (Rest Countries Dependent)__:', countriesRestCountriesDependent.length);
    console.log('Country count (Rest Countries Total)______:', countries.length);
    // console.log('\nFirst country (Rest Countries)____________:', countries[0]);

    console.log('\nCountry count (GeoNames Postal Code Info)_:', countriesGeoNames.length);

    const languageData = await fs.readFile('./helpers/data/geoLanguages.json', 'utf8');
    const languages = JSON.parse(languageData);

    console.log('\nLanguage count (ISO 639-3)________________:', languages.length);
    console.log('Language count (ISO 639-2)________________:', languages.filter((l) => !!l.idB).length);
    console.log('Language count (ISO 639-1)________________:', languages.filter((l) => !!l.id2).length);

    console.log('\n');

    const currencies = {};
    const geoCountries = [];
    const nationalities = {};
    const translations = {};
    for (const country of countries) {
        // Country label.
        const label = { en: country.name.common };
        const sortedLabel = Object.fromEntries(Object.entries(label).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));

        // Country official label.
        const labelOfficial = { en: country.name.official };
        const sortedLabelOfficial = Object.fromEntries(Object.entries(labelOfficial).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));

        // Country label and official label translations.
        for (const key of Object.keys(country.translations || {})) translations[key] = { c: (translations[key]?.c || 0) + 1 };
        for (const [key, translation] of Object.entries(country.translations)) {
            const locale = lookupLanguageUsingAlpha3(key);
            if (!locale) continue;
            label[locale.alpha2] = translation.common;
            labelOfficial[locale.alpha2] = translation.official;
        }

        // Country region and subregion.
        const geoRegion = geoRegions.find((geoRegion) => geoRegion.label.en === country.region);
        const geoSubregion = geoSubregions.find((geoSubregion) => geoSubregion.label.en === country.subregion);

        // Currencies.
        for (const [key, value] of Object.entries(country.currencies || {})) {
            if (currencies[key]) {
                const currency = currencies[key];
                if (currency.value.symbol !== value.symbol)
                    console.log('! Different currency symbol:', key, '/', currency.country, 'v', country.name.common, '-', `'${currency.value.symbol}'`, 'v', `'${value.symbol}'`);
                if (currency.value.name !== value.name)
                    console.log('! Different currency name__:', key, '/', currency.country, 'v', country.name.common, '-', `'${currency.value.name}'`, 'v', `'${value.name}'`);
                currency.c += 1;
            } else {
                currencies[key] = { c: 1, country: country.name.common, value };
            }
        }

        // Nationalities.
        for (const value of Object.values(country.demonyms.eng || {})) {
            if (value) nationalities[country.cca2] = { name: value, regionId: geoRegion.id, subregionId: geoSubregion?.id };
        }

        // Postal code count/range.
        const postalCodeInfo = countriesGeoNames.find((countryGeoNames) => country.cca2 === countryGeoNames.countryCode);

        // Country.
        geoCountries.push({
            id: String(country.cca2).toLocaleLowerCase('en'),
            // id3: String(country.cca3).toLocaleLowerCase('en'),
            // idCIOC: String(country.cioc).toLocaleLowerCase('en'),
            // idNum: String(country.ccn3),
            label: sortedLabel,
            labelOfficial: sortedLabelOfficial,
            // capitals: country.capital,
            // continents: country.continents,
            // currencies: country.currencies,
            independent: country.independent,
            maxPostalCode: postalCodeInfo?.maxPostalCode,
            minPostalCode: postalCodeInfo?.minPostalCode,
            numPostalCodes: postalCodeInfo?.numPostalCodes ?? 0,
            regionId: geoRegion.id,
            subregionId: geoSubregion?.id,
            unMember: country.unMember
        });

        // Informational messages.
        if (country.capital?.length > 1) console.log('! Multiple capitals________:', country.name.common, '-', country.capital);
        if (country.continents.length > 1) console.log('! Multiple continents______:', country.name.common, '-', country.continents);
        if (Object.keys(country.currencies ?? {}).length > 1) console.log('! Multiple currencies______:', country.name.common);
    }

    // Label translations.
    for (const [key, value] of Object.entries(translations || {})) {
        value.id2 = lookupLanguageUsingAlpha3(key)?.alpha2 || null;
        value.idB = lookupLanguageUsingAlpha3(key)?.['alpha3-b'] || null;
        value.idT = lookupLanguageUsingAlpha3(key)?.['alpha3-t'] || '';
        value.l = lookupLanguageUsingAlpha3(key)?.English || null;
    }
    const sortedTranslations = Object.fromEntries(Object.entries(translations).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
    console.log('! Label Translations_______:', sortedTranslations);

    // Cities.

    // Countries.
    await fs.writeFile('./helpers/data/geoCountries.json', JSON.stringify(geoCountries, null, 4), 'utf-8');

    // Currencies.
    const finCurrencies = [];
    const sortedCurrencies = Object.fromEntries(Object.entries(currencies).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
    for (const [key, value] of Object.entries(sortedCurrencies)) {
        finCurrencies.push({ id: key.toLocaleLowerCase(), name: value.value.name, symbol: value.value.symbol });
    }
    await fs.writeFile('./helpers/data/finCurrencies.json', JSON.stringify(finCurrencies, null, 4), 'utf-8');

    // // Languages.
    // const geoLanguages = [];
    // for (const language of languages) {
    //     let lang2 = languages2.find((lang2) => lang2.id === language['alpha3-t']);
    //     if (!lang2) lang2 = languages2.find((lang2) => lang2.id === language['alpha3-b']);
    //     if (!lang2) {
    //         console.log('? Ignoring language________:', language['alpha3-b'], language['alpha3-t'], language.English);
    //         continue;
    //     }
    //     geoLanguages.push({ id: language['alpha3-t'], idB: language['alpha3-b'] || undefined, id2: language.alpha2 || undefined, label: { en: language.English } });
    // }
    // await fs.writeFile('./helpers/data/geoLanguages.json', JSON.stringify(geoLanguages, null, 4), 'utf-8');

    // Nationalities.
    const geoNationalities = [];
    for (const [key, value] of Object.entries(nationalities)) {
        geoNationalities.push({ id: key.toLocaleLowerCase(), label: { en: value.name }, regionId: value.regionId, subregionId: value.subregionId });
    }
    await fs.writeFile('./helpers/data/geoNationalities.json', JSON.stringify(geoNationalities, null, 4), 'utf-8');

    // Utilities
    function lookupLanguageUsingAlpha3(code) {
        const alpha3BMatch = languages.find((item) => item.id === code);
        if (alpha3BMatch) return alpha3BMatch;

        const alpha3TMatch = languages.find((item) => item.idB === code);
        if (alpha3TMatch) return alpha3TMatch;

        console.log('! Missing Locale___________:', code);
        return undefined;
    }
}

async function transformLanguageData() {
    const fileContent = await fs.readFile('./helpers/data/downloads/geoNamesLanguages.tsv', 'utf8');
    const jsonData = tabToJson(fileContent);
    const languages = [];
    for (const rec of jsonData) {
        if (!rec['ISO 639-3']) {
            console.log('! Ignore blank ISO 639-3________:', rec['ISO 639-2'], rec['ISO 639-1'], rec['Language Name']);
            continue;
        }
        const matches = rec['ISO 639-2'].match(/^(.+?)\s*\/\s*(.+?)\s*\*.*$/);
        if (matches) {
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
    await fs.writeFile('./helpers/data/geoLanguages.json', JSON.stringify(languages, null, 4), 'utf-8');
}

async function transformTimeZoneData1() {
    const timeZones = Intl.supportedValuesOf('timeZone').map((timeZoneName) => ({ name: timeZoneName }));
    timeZones.sort((left, right) => left.name.localeCompare(right.name));
    await fs.writeFile('./helpers/data/geoTimeZones1.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

async function transformTimeZoneData2() {
    const fileContent = await fs.readFile('./helpers/data/downloads/geoNamesTimeZones.tsv', 'utf8');
    const jsonData = tabToJson(fileContent);
    await fs.writeFile('./helpers/data/geoTimeZones2.json', JSON.stringify(jsonData, null, 4), 'utf-8');
}

function tabToJson(tabDelimitedText) {
    const lines = tabDelimitedText.trim().split('\n');
    const headers = lines[0].split('\t').map((header) => header.trim());
    const jsonObjects = lines.slice(1).map((line, index) => {
        const values = line.split('\t');
        if (values.length !== headers.length) {
            console.warn(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
        }
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });

    return jsonObjects;
}

await transformLanguageData();

await transformCountryData();

await transformTimeZoneData1();
await transformTimeZoneData2();
