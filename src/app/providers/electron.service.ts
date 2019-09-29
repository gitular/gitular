import { Injectable } from "@angular/core";
import * as childProcess from "child_process";
import { ipcRenderer, remote, webFrame } from "electron";
import * as fs from "fs";

// If you import a module but never use any of the imported values other than as TypeScript types,
// The resulting javascript file will look as if you never imported the module at all.

@Injectable()
export class ElectronService {
    public childProcess: typeof childProcess;
    public fs?: typeof fs;

    public ipcRenderer: typeof ipcRenderer;
    public remote: typeof remote;
    public webFrame: typeof webFrame;

    public constructor() {
        // Conditional imports
        if (this.isElectron()) {
            this.ipcRenderer = window.require("electron").ipcRenderer;
            this.webFrame = window.require("electron").webFrame;
            this.remote = window.require("electron").remote;

            this.childProcess = window.require("child_process");
            this.fs = window.require("fs");
        }
    }

    public isElectron = () =>
        window && window.process && window.process.type

}
