const TYPES = {
    STRING: "string",
    ARRAY: "array",
    OBJECT: "object",
    FUNCTION: "function"
};

export {TYPES, traversalObject, onError}

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
