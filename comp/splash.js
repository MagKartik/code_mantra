// import {BrowserWindow} from "electron";
// import url from "url";
// import path from "path";
// import log from "electron-log";

const { BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");
const log = require("electron-log");

const logger = log.scope("splash");

const createSplash = () => {
  logger.info("createSplash");
  let splashWindow = new BrowserWindow({
    width: 710,
    height: 155,
    backgroundColor: "#ffffff",
    transparent: true,
    show: false,
    alwaysOnTop: true,
    frame: false,
    maximizable: false,
    fullscreenable: false,
    thickFrame: false
  });
  // splashWindow.setIcon('./src/icons/win/icon.ico');
  splashWindow.removeMenu();
  splashWindow.on("closed", function () {
    splashWindow = null;
  });

  splashWindow
    .loadURL(
      url.format({
        pathname: path.join(__dirname, "splash.html"),
        protocol: "file:",
        slashes: true
      })
    )
    .then(() => {
      logger.info("createSplash.load");
      splashWindow && splashWindow.show();
    })
    .catch((reason) => {
      try {
        splashWindow && !splashWindow.isDestroyed() && splashWindow.close();
      } catch (err) {
        err instanceof Error
          ? logger.error(err)
          : logger.error(`win32: ${JSON.stringify(err)}`);
      }
      logger.error(`createSplash.catch: ${JSON.stringify(reason)}`);
      // if (reason && reason.code === 'ERR_ABORTED') {
      //     return;
      // }
      // dialog.showErrorBox('Error encountered', JSON.stringify(reason));
    });

  return splashWindow;
};

module.exports = { createSplash };
