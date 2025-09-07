import fs from 'fs';

async function retrieveCountryData() {
    const responseForIndependent = await fetch('https://restcountries.com/v3.1/independent?status=true');
    const dataForIndependent = await responseForIndependent.text();
    fs.writeFileSync('./helpers/data/retrievals/countryDataFromCountryRestIndependent.json', dataForIndependent);

    const responseForDependent = await fetch('https://restcountries.com/v3.1/independent?status=false');
    const dataForDependent = await responseForDependent.text();
    fs.writeFileSync('./helpers/data/retrievals/countryDataFromCountryRestDependent.json', dataForDependent);
}

retrieveCountryData();
