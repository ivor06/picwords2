/**
 * http://stackoverflow.com/questions/35534959/access-key-and-value-of-object-using-ngfor
 */

import {Pipe, PipeTransform} from "@angular/core";
import {ObjectType} from "../../../common/interfaces";

@Pipe({name: "keys"})

export class KeysPipe implements PipeTransform {
    transform(value: any, args: string[]): ObjectType[] {
        const keys: ObjectType[] = [];
        for (let key in value) {
            if (value.hasOwnProperty(key))
                keys.push({key: key, value: value[key]});
        }
        return keys;
    }
}
