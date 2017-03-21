import {Pipe, PipeTransform} from "@angular/core";

import {ObjectType} from "../../../common/interfaces";
import {traversalObject} from "../../../common/util";

@Pipe({name: "objecToArray"})

export class ObjectToArrayPipe implements PipeTransform {
    transform(value: ObjectType, keyToField: string): ObjectType[] {
        const resultArray: ObjectType[] = [];
        traversalObject(value, (obj, key) => {
            if (keyToField && keyToField.length)
                obj[keyToField] = key;
            resultArray.push(obj);
        });
        return resultArray;
    }
}
