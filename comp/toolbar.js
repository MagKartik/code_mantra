// import {BrowserView} from "electron";
// import path from "path";
// import env from "../env";
// import log from "electron-log";

const { BrowserView } = require("electron");
const path = require("path");
const env = require("../env");
const log = require("electron-log");

const logger = log.scope("toolbar");

function createToolBar() {
  logger.info("createToolBar");
  const toolbarView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      webSecurity: true,
      webviewTag: false,
      enableRemoteModule: false,
      contextIsolation: true,
      devTools: false
    }
  });
  toolbarView.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true
  });
  toolbarView.webContents.loadURL("https://www.codetantra.com/toolbar.jsp");
  logger.info("createToolBar.load");
  return toolbarView;
}

module.exports = createToolBar;
