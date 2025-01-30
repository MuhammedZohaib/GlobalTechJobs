const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { shell } = require("electron");

ipcMain.handle("open-external-link", async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (error) {
    console.error("Failed to open URL:", error);
  }
});

app.whenReady().then(() => {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, "renderer.js"),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });
  mainWindow.maximize();
  mainWindow.loadFile("index.html");
});

ipcMain.handle("fetch-companies", async (event) => {
  const filePath = path.join(__dirname, "./Companies.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const companies = JSON.parse(data);
    return { companies };
  } catch (err) {
    console.error("Error reading JSON file:", err);
    return { companies: [] };
  }
});
