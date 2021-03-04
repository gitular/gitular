import { InjectionToken } from '@angular/core';

export const BrowserStorageInjectionToken = new InjectionToken<Storage>(
    'Browser Storage',
    {
        providedIn: 'root',
        factory: () => localStorage
    }
);
