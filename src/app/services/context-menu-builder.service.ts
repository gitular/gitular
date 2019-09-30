import { ApplicationRef, Injectable } from "@angular/core";
import { remote } from "electron";

import { IContextMenu } from "./IContextMenu";

@Injectable({
    providedIn: "root",
})
export class ContextMenuBuilderService {

    public constructor(
        private readonly ref: ApplicationRef,
    ) {}

    public show(menuData: IContextMenu) {
        const menu: Electron.Menu = new remote.Menu();

        for (const label in menuData) {
            const fn: () => Promise<string[]> = menuData[label];
            menu.append(new remote.MenuItem({
                click: (): void => {
                    fn()
                        .then(() => {
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
