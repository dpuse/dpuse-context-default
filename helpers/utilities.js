export function tabToJson(tabDelimitedText) {
    const lines = tabDelimitedText.trim().split('\n');
    const headers = lines[0].split('\t').map((header) => header.trim());
    const jsonObjects = lines.slice(1).map((line, index) => {
        const values = line.split('\t');
        if (values.length !== headers.length) {
            console.warn(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`);
        }
        const obj = {};
        headers.forEach((header, i) => {
            obj[header] = values[i] ? values[i].trim() : '';
        });
        return obj;
    });

    return jsonObjects;
}
