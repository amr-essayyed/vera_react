export function assignNestedValue(obj: any, key: string, value: any) {
    const keys = key.replace(/\]/g, "").split("[");

    let current = obj;

    keys.forEach((k, i) => {
        const isLast = i === keys.length - 1;

        if (isLast) {
            current[k] = value;
            return;
        }

        if (!current[k]) {
            current[k] = isNaN(Number(keys[i + 1])) ? {} : [];
        }

        current = current[k];
    });
}
