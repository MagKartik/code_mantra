const { BrowserWindow } = require("electron");
const log = require("electron-log");
const { store } = require("./store");

const logger = log.scope("ejs");

const ejs = (code) => {
  if (store.get("mainWindowID")) {
    logger.silly("ejs");
    return BrowserWindow.fromId(
      store.get("mainWindowID")
    ).webContents.executeJavaScript(code);
  }
};

module.exports = ejs;
