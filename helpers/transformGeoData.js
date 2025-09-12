import fs from 'fs/promises';
import geoRegions from './data/geoRegions.json' with { type: 'json' };
import geoSubregions from './data/geoSubregions.json' with { type: 'json' };
import { tabToJson } from './utilities.js';

async function transformCountryData() {
    const countriesFromRestCountriesData = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountries.json', 'utf-8');
    const countries = JSON.parse(countriesFromRestCountriesData);

    const countryDataGeoNames = await fs.readFile('./helpers/data/retrievals/countriesFromGeoNamesPostalCodeCountryInfo.json', 'utf-8');
    const countriesGeoNames = JSON.parse(countryDataGeoNames).geonames;

    // console.log('\nFirst country (Rest Countries)____________:', countries[0]);

    const languageData = await fs.readFile('./helpers/data/geoLanguages.json', 'utf8');
    const languages = JSON.parse(languageData);

    console.log('\n');

    const geoCountries = [];
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

async function transformTimeZoneData1() {
    const timeZones = Intl.supportedValuesOf('timeZone').map((timeZoneName) => ({ name: timeZoneName }));
    timeZones.sort((left, right) => left.name.localeCompare(right.name));
    console.log(111, timeZones.length);
    await fs.writeFile('./helpers/data/geoTimeZones1.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

async function transformTimeZoneData2() {
    const browserTimeZones = Intl.supportedValuesOf('timeZone').map((timeZoneName) => ({ name: timeZoneName }));
    browserTimeZones.sort((left, right) => left.name.localeCompare(right.name));

    const geoNamesTimeZoneData = await fs.readFile('./helpers/data/downloads/geoNamesTimeZones.tsv', 'utf8');
    const geoNamesTimeZones = tabToJson(geoNamesTimeZoneData);
    console.log(222, geoNamesTimeZones.length);
    const timeZones = [];
    for (const timeZone of geoNamesTimeZones) {
        const tZ = {
            name: timeZone.TimeZoneId,
            countryId: timeZone.CountryCode.toLocaleLowerCase(),
            gmtOffset: Number(timeZone['GMT offset 1. Jan 2025']),
            dstOffset: Number(timeZone['DST offset 1. Jul 2025']),
            rawOffset: Number(timeZone['rawOffset (independant of DST)'])
        };
        const yyy = browserTimeZones.find((x) => x.name === tZ.name);
        if (!yyy) console.log('MISSING 1', tZ.name);
        timeZones.push(tZ);
    }

    for (const bTZ of browserTimeZones) {
        const yyy = timeZones.find((x) => x.name === bTZ.name);
        if (!yyy) console.log('MISSING 2', bTZ.name);
    }

    await fs.writeFile('./helpers/data/geoTimeZones2.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

await transformCountryData();

await transformTimeZoneData1();
await transformTimeZoneData2();
