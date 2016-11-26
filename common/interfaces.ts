/// <reference path="../typings/index.d.ts" />

export {
    HashObject,
    HashString,
    MapHashString,
    GeoCoordinates,
    Achievements,
    KeyboardEventWithTargetValue
}

interface HashObject<T> { [key: string]: T; }
interface HashString extends HashObject<string> {}
interface MapHashString extends Map<string, HashString> {}

interface GeoCoordinates {
    latitude: string;
    longitude: string;
}

interface Achievements {
    total?: number;
    combo?: string;
    minTime?: number;
}

interface KeyboardEventWithValue extends EventTarget {
    value: string;
}

interface KeyboardEventWithTargetValue extends KeyboardEvent {
    target: KeyboardEventWithValue;
}
