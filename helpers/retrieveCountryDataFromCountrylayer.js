import 'dotenv/config';
import fs from 'fs';
async function retrieveCountryData() {
    const accessKey = process.env.COUNTRYLAYER_ACCESS_KEY;
    const response = await fetch(`https://api.countrylayer.com/v2/all?access_key=${accessKey}`);
    const data = await response.text();
    fs.writeFileSync('./helpers/countryDataFromCountrylayer.json', data);
}

retrieveCountryData();
