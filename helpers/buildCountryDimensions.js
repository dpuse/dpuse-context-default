import fs from 'fs/promises';

async function buildDimensions() {
    const data = await fs.readFile('./helpers/countryDataFromCountryLayer.json', 'utf-8');
    const countries = JSON.parse(data);
    console.log('Number of countries:', countries.length);
    console.log('First country:', countries[0]);

    const data2 = await fs.readFile('./helpers/countryDataFromCountryRestIndependent.json', 'utf-8');
    const countries2 = JSON.parse(data2);
    console.log('Number of countries:', countries2.length);
    console.log('First country:', countries2[0]);

    const data3 = await fs.readFile('./helpers/countryDataFromCountryRestDependent.json', 'utf-8');
    const countries3 = JSON.parse(data3);
    console.log('Number of countries:', countries3.length);
    console.log('First country:', countries3[0]);
}

buildDimensions();
