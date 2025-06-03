export const calcApproxObjSize = (data) => {
    const objectList = [];
    const stack = [data];
    let bytes = 0;
    while (stack.length) {
        const value = stack.pop();
        if (typeof value === 'boolean') {
            bytes += 4;
        }
        else if (typeof value === 'string') {
            bytes += value.length * 2;
        }
        else if (typeof value === 'number') {
            bytes += 8;
        }
        else if (value && typeof value === 'object' && objectList.indexOf(value) === -1) {
            bytes += Buffer.from(JSON.stringify(value)).length;
        }
    }
    return bytes;
};
export const checkExpiration = (expiresAt) => {
    let result = false;
    if (expiresAt !== null) {
        if (new Date().getTime() > expiresAt) {
            result = true;
        }
    }
    return result;
};
export const warnMsg = (text) => {
    console.warn('[MinCache] Warning! ' + text);
};
