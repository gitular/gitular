import {Injectable, ApplicationRef} from '@angular/core';
import {remote} from 'electron';

@Injectable({
    providedIn: 'root'
})
export class ContextMenuBuilderService {

    constructor(
        private ref: ApplicationRef
    ) {}


    show(menuData: Menu) {
        const menu = new remote.Menu();

        for (let label in menuData) {
            const fn: () => Promise<any> = menuData[label];
            menu.append(new remote.MenuItem({
                label,
                click: () => {
                    fn().then(() => {
                        this.ref.tick();
                    });
                }
            }));
        }

        menu.popup({
            window: remote.BrowserWindow.getFocusedWindow()
        });
    }

}

export interface Menu {
    [label: string]: () => Promise<any>
}