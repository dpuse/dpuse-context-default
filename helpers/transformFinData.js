import fs from 'fs/promises';

async function transformCurrencies() {
    const countryDataRestCountriesIndependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesIndependent.json', 'utf-8');
    const countriesRestCountriesIndependent = JSON.parse(countryDataRestCountriesIndependent);
    const countryDataRestCountriesDependent = await fs.readFile('./helpers/data/retrievals/countriesFromRestCountriesDependent.json', 'utf-8');
    const countriesRestCountriesDependent = JSON.parse(countryDataRestCountriesDependent);
    const countries = [...countriesRestCountriesIndependent, ...countriesRestCountriesDependent];
    const currencies = {};
    for (const country of countries) {
        if (Object.keys(country.currencies ?? {}).length > 1) console.log('! Multiple currencies for', `'${country.name.common}'.`);

        for (const [key, value] of Object.entries(country.currencies || {})) {
            if (currencies[key]) {
                const currency = currencies[key];
                if (currency.value.symbol !== value.symbol)
                    console.log(
                        '! Different currency symbol for',
                        `${key}, existing: '${currency.country}' - '${currency.value.symbol}'; new: '${country.name.common}' - '${value.symbol}'.`
                    );
                if (currency.value.name !== value.name)
                    console.log(
                        '! Different currency name for',
                        `${key}, existing: '${currency.country}' - '${currency.value.name}'; new: '${country.name.common}' - '${value.name}'.`
                    );
                currency.c += 1;
            } else {
                currencies[key] = { c: 1, country: country.name.common, value };
            }
        }
    }

    const finCurrencies = [];
    const sortedCurrencies = Object.fromEntries(Object.entries(currencies).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
    for (const [key, value] of Object.entries(sortedCurrencies)) {
        finCurrencies.push({ id: key.toLocaleLowerCase(), name: value.value.name, symbol: value.value.symbol });
    }
    await fs.writeFile('./helpers/data/finCurrencies.json', JSON.stringify(finCurrencies, null, 4), 'utf-8');
}

console.log('# Transforming Currency Data...');
transformCurrencies();
