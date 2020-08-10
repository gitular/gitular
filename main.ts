import { app, shell, BrowserWindow, screen } from "electron";
import * as path from "path";
import * as url from "url";

let win, serve;
const args = process.argv.slice(1);
serve = args.some((val) => val === "--serve");

function createWindow() {
    const iconPath: string = __dirname + "/dist/assets/logo.png";

    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false
        },
        icon: iconPath
    });

    if (serve) {
        require("electron-reload")(__dirname, {
            electron: require(path.join(__dirname, "node_modules/electron"))
        });
        win.loadURL("http://localhost:4200");
    } else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, "./dist/index.html"),
            protocol: 'file:',
            slashes: true,
        }));
    }

    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store window
        // In an array if your app supports multi windows, this is the time
        // When you should delete the corresponding element.
        win = null;
    });
}

try {
    // This  thod will be called when Electron has finished
    // Initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", createWindow);

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
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // Catch Error
    throw e;
}
