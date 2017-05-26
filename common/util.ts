import {HashObject} from "./interfaces";
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
    removeUndefined,
    isEmptyObject,
    onError,
    isNumber,
    isString,
    isObject,
    isContainsValue,
    promiseSeries,
    resolvedPromise,
    rejectedPromise
}

function traversalObject(obj: HashObject<any>, iterator: (obj: any, key: string) => void) {
    let result = false;
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION) {
        if (Object.keys.length > 0) {
            result = true;
            Object.keys(obj).forEach(key => {
                try {
                    iterator(obj[key], key);
                } catch (e) {
                    result = false;
                }
            });
        }
    }
    return result;
}

function someObjectKeys(obj: any, iterator: (obj: any, key: string) => boolean) {
    let result = false;
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION) {
        if (Object.keys.length > 0) {
            result = true;
            return Object.keys(obj).some(key => {
                try {
                    return !!iterator(obj[key], key);
                } catch (e) {
                    return false;
                }
            });
        }
    }
    return result;
}

function removeObjectKeys<T>(obj: T, fieldList: string[]): T {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length)
        fieldList.forEach(field => delete obj[field]);
    return obj;
}

function filterObjectKeys<T>(obj: HashObject<any>, fieldList: string[]): HashObject<any> {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length) {
        // let result: T = Object.create(obj);
        let result: T = {} as T;
        fieldList.forEach(field => {
            if (obj.hasOwnProperty(field) && obj[field] !== null)
                result[field] = obj[field];
        });
        return result;
    }
    return obj;
}

function removeUndefined<T>(obj: T): T {
    traversalObject(obj, (value, key) => {
        if (value === undefined)
            delete obj[key];
        else if (value && isObject(value))
            removeUndefined(value);
    });
    return obj;
}

function displayObject(obj) {
    for (let key of obj) {
        if (obj.hasOwnProperty(key) && !(obj[key] instanceof Function))
            console.error(key + ": " + obj[key]);
    }
}

function onError(error) {
    console.error((new Date()).toLocaleTimeString() + " error: ", error);
    if (error instanceof Object) displayObject(error);
}

function promiseSeries(promiseList: Promise<any>[], callback?): Promise<any[]> {
    const resultList = [];
    return promiseList.reduce((prev, promise) => prev.then(() => promise.then(result => {
        if (typeof callback === TYPES.FUNCTION)
            resultList.push(callback(result));
        return resultList;
    })), null);
}

function isNumber(value: any): boolean {
    // return (value !== null) && !isNaN(value) && (typeof value === TYPES.NUMBER);
    return typeof value === TYPES.NUMBER || value instanceof Number;
}

function isString(value: any): boolean {
    return typeof value === TYPES.STRING || value instanceof String;
}

function isObject(value: any): boolean {
    return typeof value === TYPES.OBJECT;
}

function isEmptyObject(obj: any): boolean {
    return (obj == null || (isObject(obj) && Object.getOwnPropertyNames(obj).length === 0));
}

function isContainsValue<T>(obj: HashObject<T> | T[], value: T): boolean {
    let result = false;
    if (obj instanceof Array)
        result = obj.some(item => item === value);
    else if ((obj instanceof Object) && !isEmptyObject(obj))
        return someObjectKeys(obj, (item => item === value));
    return result;
}

function resolvedPromise<T>(value: T): Promise<T> {
    return new Promise((resolve, reject) => resolve(value));
}

function rejectedPromise<T>(value: T): Promise<T> {
    return new Promise((resolve, reject) => reject(value));
}
