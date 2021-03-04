import { Inject, Injectable } from '@angular/core';
import { BrowserStorageInjectionToken } from './BrowserStorageInjectionToken';
import { DataStoreI } from './DataStoreI';


@Injectable({
    providedIn: 'root'
})
export class LocalStorageService<T> implements DataStoreI<T> {

    constructor(
        @Inject(BrowserStorageInjectionToken) private readonly storage: Storage
    ) { }

    public write(item: string, value: object) {
        const stringValue: string = JSON.stringify(value);

        this.storage.setItem(item, stringValue);
    }


    public read(id: string): T | undefined {
        const stringValue: string | null = this.storage.getItem(id);
        if (stringValue === null) {
            return undefined;        }

        return JSON.parse(stringValue) as T;
    }

}