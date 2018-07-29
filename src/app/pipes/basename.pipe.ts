import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'basename'
})
export class BasenamePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return BasenamePipe.baseName(value);
    }

    public static baseName(str) {
        var base = new String(str).substring(str.lastIndexOf('/') + 1);
        if (base.lastIndexOf(".") != -1)
            base = base.substring(0, base.lastIndexOf("."));
        return base;
    }

}
