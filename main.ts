import { App, app, BrowserWindow, nativeImage } from "electron";
import * as path from "path";
import { format } from "url";

export class MainApp {
    private mainWindow: BrowserWindow | undefined;

    public constructor(
        private readonly developmentMode: boolean,
    ) { }

    private createWindow(): void {
        // TODO: work out how to use the right path
        const iconPath: string = __dirname + "/dist/assets/logo.png";

        this.mainWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                webSecurity: !this.developmentMode
            },
            icon: nativeImage.createFromPath(
                iconPath
            ),
            autoHideMenuBar: !this.developmentMode,
        });

        const url: string = this.getStartUrl();

        this.mainWindow.loadURL(url);


        if (this.developmentMode) {
            this.mainWindow.webContents.openDevTools();
        }

        // Emitted when the window is closed.
        this.mainWindow.on("closed", () => {
            // Dereference the window object, usually you would store window
            // In an array if your app supports multi windows, this is the time
            // When you should delete the corresponding element.
            this.mainWindow = undefined;
        });
    }

    private getStartUrl() {
        if (this.developmentMode) {
            require("electron-reload")(__dirname, {
                electron: require(path.join(__dirname, "node_modules/electron"))
            });
            return "http://localhost:4200";
        } else {
            return format({
                pathname: path.join(__dirname, "./dist/index.html"),
                protocol: 'file:',
                slashes: true,
            });
        }
    }

    public start(app: App) {
        // This  thod will be called when Electron has finished
        // Initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => {
            this.createWindow();
        });

        // Quit hen all windows are closed.
        app.on("window-all-closed", () => {
            // On OS X it is common for applications and their menu bar
            // T stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== "darwin") {
                app.quit();
            }
        });

        app.on("activate", () => {
            // On OS X it's common to re-create a window in the app when the
            // Dock icon is clicked and there are no other windows open.
            if (this.mainWindow === undefined) {
                this.createWindow();
            }
        });
    }
}



try {
    const args: string[] = process.argv.slice(1);
    const developmentMode: boolean = args.some((val) => val === "--dev");
    new MainApp(developmentMode).start(app);
} catch (e) {
    // Catch Error
    throw e;
}
