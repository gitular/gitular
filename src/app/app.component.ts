import { Component } from "@angular/core";

import { APP_CONFIG } from "../environments/environment";

import { ElectronService } from "./providers/electron.service";

/**
 * AppComponents
 */
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
})
export class AppComponent {
    public electronService: ElectronService;

    public constructor(electronService: ElectronService) {
        this.electronService = electronService;
        console.log("APP_CONFIG", APP_CONFIG);

        if (electronService.isElectron()) {
            console.log("Mode electron");
            console.log("Electron ipcRenderer", electronService.ipcRenderer);
            console.log("NodeJS childProcess", electronService.childProcess);
        } else {
            console.log("Mode web");
        }
    }
}
