import { retrieveCountries } from './index';

async function main() {
    try {
        await retrieveCountries();
        console.log('Done!');
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
