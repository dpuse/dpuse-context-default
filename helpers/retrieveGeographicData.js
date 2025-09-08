import fs from 'fs/promises';

async function retrieveCountryData() {
    const responseForIndependent = await fetch('https://restcountries.com/v3.1/independent?status=true');
    const dataForIndependent = await responseForIndependent.text();
    fs.writeFile('./helpers/data/retrievals/countryDataFromCountryRestIndependent.json', dataForIndependent, 'utf-8');

    const responseForDependent = await fetch('https://restcountries.com/v3.1/independent?status=false');
    const dataForDependent = await responseForDependent.text();
    fs.writeFile('./helpers/data/retrievals/countryDataFromCountryRestDependent.json', dataForDependent, 'utf-8');
}

retrieveCountryData();
