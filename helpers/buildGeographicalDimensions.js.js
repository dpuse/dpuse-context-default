import fs from 'fs/promises';

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
    // console.log(getUTCOffset('America/New_York')); // "GMT-4" (in summer)
    // console.log(getUTCOffset('Europe/Berlin')); // "GMT+2" (in summer)
    // console.log(getUTCOffset('Asia/Kolkata')); // "GMT+5:30"
}

buildGeographicalDimensions();

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

// Function to convert "UTC±hh:mm" to minutes
function utcOffsetToMinutes(offset) {
    const match = offset.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
}
