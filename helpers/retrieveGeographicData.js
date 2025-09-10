import 'dotenv/config';
import fs from 'fs/promises';

async function retrieveCountryData() {
    // Rest Countries independent data.
    const restCountriesIndependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=true');
    const restCountriesIndependentData = await restCountriesIndependentResponse.text();
    fs.writeFile('./helpers/data/retrievals/countriesFromRestCountriesIndependent.json', restCountriesIndependentData, 'utf-8');

    // Rest Countries dependent data.
    const restCountriesDependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=false');
    const restCountriesDependentData = await restCountriesDependentResponse.text();
    fs.writeFile('./helpers/data/retrievals/countriesFromRestCountriesDependent.json', restCountriesDependentData, 'utf-8');

    // GeoNames country data.
    const geoNamesUsername = process.env.GEO_NAMES_USERNAME;
    const geoNamesPostalCodeCountryInfoResponse = await fetch(`http://api.geonames.org/postalCodeCountryInfoJSON?username=${geoNamesUsername}`);
    const geoNamesPostalCodeCountryInfoData = await geoNamesPostalCodeCountryInfoResponse.text();
    fs.writeFile('./helpers/data/retrievals/countriesFromGeoNamesPostalCodeCountryInfo.json', geoNamesPostalCodeCountryInfoData, 'utf-8');
}

retrieveCountryData();
