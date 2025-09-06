import fs from 'fs/promises';

async function buildDimensions() {
    const countryDataFromCountryLayer = await fs.readFile('./helpers/countryDataFromCountryLayer.json', 'utf-8');
    const countriesFromCountrylayer = JSON.parse(countryDataFromCountryLayer);
    console.log('Number of countries:', countriesFromCountrylayer.length);
    console.log('First country:', countriesFromCountrylayer[0]);

    const countryDataFromCountryRestIndependent = await fs.readFile('./helpers/countryDataFromCountryRestIndependent.json', 'utf-8');
    const countriesFromCountryRestIndependent = JSON.parse(countryDataFromCountryRestIndependent);
    console.log('Number of countries:', countriesFromCountryRestIndependent.length);
    console.log('First country:', countriesFromCountryRestIndependent[0]);

    const countryDataFromCountryRestDependent = await fs.readFile('./helpers/countryDataFromCountryRestDependent.json', 'utf-8');
    const countriesFromCountryRestDependent = JSON.parse(countryDataFromCountryRestDependent);
    console.log('Number of countries:', countriesFromCountryRestDependent.length);
    console.log('First country:', countriesFromCountryRestDependent[0]);

    const locCtry = [];
    for (const country of countriesFromCountrylayer) {
        locCtry.push(country);
    }
    console.log(locCtry);
}

buildDimensions();
