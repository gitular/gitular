import { ApplicationRef, Injectable } from "@angular/core";
import { remote } from "electron";

@Injectable({
    providedIn: "root",
})
export class ContextMenuBuilderService {

    public constructor(
        private readonly ref: ApplicationRef,
    ) {}

    public show(menuData: IMenu) {
        const menu: Electron.Menu = new remote.Menu();

        for (const label in menuData) {
            const fn: () => Promise<string[]> = menuData[label];
            menu.append(new remote.MenuItem({
                click: () => {
                    fn().then(() => {
                        this.ref.tick();
                    });
                },
                label,
            }));
        }

        menu.popup({
            window: remote.BrowserWindow.getFocusedWindow(),
        });
    }

}

export interface IMenu {
    [label: string]: () => Promise<any>;
}
