import 'dotenv/config';
import fs from 'fs/promises';

async function retrieveGeoNamesData() {
    // Country postal code information data.
    const geoNamesUsername = process.env.GEO_NAMES_USERNAME;
    const geoNamesPostalCodeCountryInfoResponse = await fetch(`http://api.geonames.org/postalCodeCountryInfoJSON?username=${geoNamesUsername}`);
    const geoNamesPostalCodeCountryInfos = await geoNamesPostalCodeCountryInfoResponse.json();
    geoNamesPostalCodeCountryInfos.geonames.sort((left, right) => left.countryCode.localeCompare(right.countryCode));
    await fs.writeFile('./helpers/data/retrievals/countriesFromGeoNamesPostalCodeCountryInfo.json', JSON.stringify(geoNamesPostalCodeCountryInfos.geonames), 'utf-8');

    // Counts.
    console.log('\nCountry count (GeoNames Postal Code Info)_:', geoNamesPostalCodeCountryInfos.geonames.length);
}

async function retrieveRestCountriesData() {
    // Independent country data.
    const restCountriesIndependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=true');
    const restCountriesIndependents = await restCountriesIndependentResponse.json();

    // Dependent country data.
    const restCountriesDependentResponse = await fetch('https://restcountries.com/v3.1/independent?status=false');
    const restCountriesDependents = await restCountriesDependentResponse.json();

    // Combined data.
    const restCountries = [...restCountriesIndependents, ...restCountriesDependents];
    restCountries.sort((left, right) => left.cca2.localeCompare(right.cca2));
    await fs.writeFile('./helpers/data/retrievals/countriesFromRestCountries.json', JSON.stringify(restCountries), 'utf-8');

    // Counts.
    console.log('Country count (Rest Countries Independent):', restCountriesIndependents.length);
    console.log('Country count (Rest Countries Dependent)__:', restCountriesDependents.length);
    console.log('Country count (Rest Countries Combined)___:', restCountries.length);
}

await retrieveGeoNamesData();
await retrieveRestCountriesData();
