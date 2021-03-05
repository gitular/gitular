import { App, app, BrowserWindow, Screen, screen, Size } from "electron";
import { join } from "path";
import { format } from "url";

export class MainApp {

    private mainWindow: BrowserWindow | undefined;

    public constructor(
        private readonly developmentMode: boolean,
        private readonly electronScreen: Screen,
    ) { }

    private getMainWindowSize(): Size {
        const size: Size = this.electronScreen.getPrimaryDisplay().workAreaSize;
        const width: number = (size.width > 400) ? 400 : size.width;
        const height: number = size.height;

        return {
            width,
            height,
        };
    }

    private createWindow(): void {
        const size: Size = this.getMainWindowSize();

        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            // x: 0,
            // y: 0,
            width: size.width,
            height: size.height,
            webPreferences: {
                // webSecurity: this.developmentMode,
                nodeIntegration: true,
                allowRunningInsecureContent: (this.developmentMode) ? true : false
            },
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
                electron: require(join(__dirname, "node_modules/electron"))
            });
            return "http://localhost:4200";
        } else {
            return format({
                pathname: join(__dirname, "./dist/index.html"),
                protocol: 'file:',
                slashes: true,
            });
        }
    }

    public start(app: App) {
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
        app.on("ready", () => {
            return setTimeout(() => {
                this.createWindow();
            }, 400);
        });

        // Quit when all windows are closed.
        app.on("window-all-closed", () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
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


const args: string[] = process.argv.slice(1);
const developmentMode: boolean = args.some((val: string) => {
    return val === "--serve";
});
new MainApp(developmentMode, screen).start(app);