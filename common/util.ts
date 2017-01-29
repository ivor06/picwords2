const TYPES = {
    STRING: "string",
    NUMBER: "number",
    ARRAY: "array",
    OBJECT: "object",
    FUNCTION: "function"
};

export {
    TYPES,
    traversalObject,
    removeObjectKeys,
    filterObjectKeys,
    isEmptyObject,
    onError,
    isNumber,
    promiseSeries
}

// TODO ObjectType from KeysPipe
function traversalObject(obj: any, iterator: (obj: any, key: string) => void) {
    let result = false;
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION) {
        if (Object.keys.length > 0) {
            result = true;
            Object.keys(obj).forEach(key => iterator(obj[key], key));
        }
    }
    return result;
}

function removeObjectKeys<T>(obj: T, fieldList: string[]): T {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length)
        fieldList.forEach(field => delete obj[field]);
    return obj;
}

function filterObjectKeys<T>(obj: T, fieldList: string[]): T {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length) {
        let result = Object.create(obj);
        fieldList.forEach(field => {
            if (obj.hasOwnProperty(field) && obj[field] !== null)
                result[field] = obj[field];
        });
        return result;
    }
    return obj;
}

function isEmptyObject(obj: any): boolean {
    return (obj == null || ((typeof obj === TYPES.OBJECT) && Object.getOwnPropertyNames(obj).length === 0));
}

function displayObject(obj) {
    for (let key of obj) {
        if (obj.hasOwnProperty(key) && !(obj[key] instanceof Function))
            console.log(key + ": " + obj[key]);
    }
}

function onError(error) {
    console.error((new Date).toLocaleTimeString() + " error: ", error);
    if (error instanceof Object) displayObject(error);
}

function promiseSeries(promiseList: Promise<any>[], callback?): Promise<any[]> {
    const resultList = [];
    return promiseList.reduce((prev, promise) => prev.then(() => promise.then(result => {
        if (typeof callback === TYPES.FUNCTION)
            resultList.push(callback(result));
        return resultList;
    })), Promise.resolve());
}

function isNumber(value: any): boolean {
    // return (value !== null) && !isNaN(value) && (typeof value === TYPES.NUMBER);
    return typeof value === TYPES.NUMBER;
}
