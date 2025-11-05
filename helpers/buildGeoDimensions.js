import fs from 'fs/promises';
import JSZip from 'jszip';
// import kdTreeModule from 'kd-tree-javascript';
// const kdTree = kdTreeModule.kdTree;
import KDBush from 'kdbush';

async function buildGeographicalDimensions() {
    const timeZoneNames = Intl.supportedValuesOf('timeZone');
    const timeZones = [];
    for (const timeZoneName of timeZoneNames) {
        const utcOffset = getUTCOffset(timeZoneName);
        timeZones.push({ utcOffset, name: timeZoneName });
    }
    timeZones.sort((a, b) => {
        const offsetA = utcOffsetToMinutes(a.utcOffset);
        const offsetB = utcOffsetToMinutes(b.utcOffset);
        if (offsetA !== offsetB) return offsetA - offsetB;
        return a.name.localeCompare(b.name);
    });
    fs.writeFile('./helpers/data/retrievals/timeZones.json', JSON.stringify(timeZones, null, 4), 'utf-8');
}

function getUTCOffset(timeZone) {
    const now = new Date();
    const options = { timeZone, timeZoneName: 'shortOffset' };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    let offset = parts.find((p) => p.type === 'timeZoneName')?.value || 'UTC';
    offset = offset.replace('GMT', 'UTC');
    if (offset === 'UTC') offset = 'UTC+00:00';
    const match = offset.match(/UTC([+-])(\d{1,2})(?::(\d{2}))?/);
    if (match) {
        const sign = match[1];
        const hours = match[2].padStart(2, '0');
        const minutes = match[3] || '00';
        offset = `UTC${sign}${hours}:${minutes}`;
    }
    return offset;
}

function utcOffsetToMinutes(offset) {
    const match = offset.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
}

class GeoNamesProcessor {
    constructor() {
        this.places = new Map();
        this.hierarchy = new Map();
        this.postalCodes = new Map();
        this.kdTree = null; // KD-Tree for nearest-place lookup
        this.indexedPlaces = []; // Array to store place data corresponding to KDBush indices
    }

    async downloadAndExtract(urlName, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to download ${url}`);

        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        const txtFile = Object.keys(zip.files).find((name) => name === `${urlName}.txt`);
        return await zip.file(txtFile).async('string');
    }

    parsePlacesData(text) {
        const lines = text.split('\n');
        let count = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 19) continue;

            const place = {
                geonameId: parseInt(fields[0]),
                name: fields[1],
                latitude: parseFloat(fields[4]),
                longitude: parseFloat(fields[5]),
                featureClass: fields[6],
                featureCode: fields[7],
                countryCode: fields[8],
                admin1Code: fields[10],
                admin2Code: fields[11],
                population: parseInt(fields[14]) || 0
            };

            this.places.set(place.geonameId, place);
            count++;
        }

        return count;
    }

    parseHierarchyData(text) {
        const lines = text.split('\n');
        let count = 0;

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 2) continue;

            const parentId = parseInt(fields[0]);
            const childId = parseInt(fields[1]);

            this.hierarchy.set(childId, parentId);
            count++;
        }

        return count;
    }

    // // ===== KD-Tree Build =====
    // buildKdTree() {
    //     const points = Array.from(this.places.values()).map((p) => ({
    //         lat: p.latitude,
    //         lng: p.longitude,
    //         geonameId: p.geonameId,
    //         name: p.name
    //     }));
    //     const distance = (a, b) => {
    //         const R = 6371;
    //         const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    //         const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    //         const aCalc = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    //         return 2 * R * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
    //     };
    //     this.kdTree = new kdTree(points, distance, ['lat', 'lng']);
    // }
    // Replace buildKdTree() method:
    buildKdTree() {
        // Convert places to array format for KDBush
        this.indexedPlaces = Array.from(this.places.values());

        // Extract coordinates for KDBush
        const lngs = [];
        const lats = [];

        for (const place of this.indexedPlaces) {
            lngs.push(place.longitude);
            lats.push(place.latitude);
        }

        // Build KDBush index (note: KDBush expects lng, lat order)
        this.kdTree = new KDBush(lngs.length, 64, Uint32Array);

        for (let i = 0; i < lngs.length; i++) {
            this.kdTree.add(lngs[i], lats[i]);
        }

        this.kdTree.finish();
    }

    parsePostalData(text) {
        if (!this.kdTree) this.buildKdTree();

        const lines = text.split('\n');
        let count = 0;
        console.log(1111, lines.length);

        for (const line of lines) {
            if (!line.trim()) continue;

            const fields = line.split('\t');
            if (fields.length < 12) continue;

            const postal = {
                countryCode: fields[0],
                postalCode: fields[1],
                placeName: fields[2],
                admin1Name: fields[3],
                admin1Code: fields[4],
                admin2Name: fields[5],
                admin2Code: fields[6],
                latitude: parseFloat(fields[9]),
                longitude: parseFloat(fields[10])
            };

            // // ===== KD-Tree nearest place lookup =====
            // const nearest = this.kdTree.nearest({ lat: postal.latitude, lng: postal.longitude }, 1);
            // postal.geonameId = nearest.length ? nearest[0][0].geonameId : null;
            // New:
            const nearestIndex = this.findNearest(postal.longitude, postal.latitude);
            postal.geonameId = nearestIndex !== -1 ? this.indexedPlaces[nearestIndex].geonameId : null;

            this.postalCodes.set(postal.postalCode, postal);
            count++;
        }

        console.log(3333, count);
        return count;
    }

    // Add this new method to the class:
    findNearest(lng, lat) {
        const result = this.kdTree.range(lng - 1, lat - 1, lng + 1, lat + 1);

        if (result.length === 0) return -1;

        // Calculate distances and find nearest
        let nearestIndex = -1;
        let nearestDistance = Infinity;

        for (const idx of result) {
            const place = this.indexedPlaces[idx];
            const dist = haversineDistance(lat, lng, place.latitude, place.longitude);

            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestIndex = idx;
            }
        }

        return nearestIndex;
    }

    getHierarchy(postalCode) {
        const postal = this.postalCodes.get(postalCode);
        if (!postal) return null;

        const result = {
            postalCode: postal.postalCode,
            placeName: postal.placeName,
            city: null,
            state: postal.admin1Name,
            stateCode: postal.admin1Code,
            country: postal.countryCode
        };

        if (postal.geonameId) {
            const city = this.findParentCity(postal.geonameId);
            if (city) {
                result.city = city.name;
                result.cityPopulation = city.population;
            }
        }

        if (!result.city) {
            result.city = postal.placeName;
        }

        return result;
    }

    findParentCity(geonameId) {
        let currentId = geonameId;
        const visited = new Set();

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const place = this.places.get(currentId);

            if (place && place.featureClass === 'P' && ['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC'].includes(place.featureCode)) {
                return place;
            }

            currentId = this.hierarchy.get(currentId);
        }

        return null;
    }
}

// Add this helper function (outside the class):
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ===== Usage function =====
async function buildLocationDimension(countryCode = 'US') {
    const processor = new GeoNamesProcessor();

    console.log('Loading places data...');
    const placesText = await processor.downloadAndExtract(countryCode, `http://download.geonames.org/export/dump/${countryCode}.zip`);
    const placesCount = processor.parsePlacesData(placesText);
    console.log(`Loaded ${placesCount} places`);

    console.log('Loading hierarchy data...');
    const hierarchyText = await processor.downloadAndExtract('hierarchy', 'http://download.geonames.org/export/dump/hierarchy.zip');
    const hierarchyCount = processor.parseHierarchyData(hierarchyText);
    console.log(`Loaded ${hierarchyCount} hierarchy relationships`);

    console.log('Loading postal codes...');
    const postalText = await processor.downloadAndExtract(countryCode, `http://download.geonames.org/export/zip/${countryCode}.zip`);
    console.log('Parsing postal codes...');
    const postalCount = processor.parsePostalData(postalText);
    console.log(`Loaded ${postalCount} postal codes`);

    return processor;
}

// ===== Example usage =====
const processor = await buildLocationDimension('AU');
const result = processor.getHierarchy('4020');
console.log('RESULT', result);
