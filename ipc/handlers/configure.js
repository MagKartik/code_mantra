// import {app, Notification} from "electron";
// import log from "electron-log";

// import {store} from "../../comp/store";
// import {getMainWindow} from "../../comp/window";

const { app, Notification, BrowserWindow } = require("electron");
const log = require("electron-log");

const { store } = require("../../comp/store");

const logger = log.scope("configure");

let allowAccessToOtherApps = true;

const isEqual = (o1, o2) =>
  o1 === o2 || JSON.stringify(o1) === JSON.stringify(o2);

function configureSea(config) {
  logger.info(`handler.configureSea`);
  const currentConfig = store.get("config");
  if (config && !isEqual(config, currentConfig)) {
    // Updating new config in the store
    // store.set("config", config);
    logger.silly(
      "CodeTantra wanted to change the config, but this is Mantra, so fuck em."
    );
    logger.silly("Here's the changelog:");
    logger.debug(`Old config: ${JSON.stringify(currentConfig)}`);
    logger.debug(`New config: ${JSON.stringify(config)}`);
    // allowAccessToOtherApps = config.allowAccessToOtherApps;
    // logger.info(`Re-launching application`);
    logger.silly("Preventing re-launch.");
    // const mw = BrowserWindow.fromId(store.get("mainWindowID"));
    // store.set("relaunch", mw && mw.webContents.getURL());
    // new Notification({
    //   title: "Reconfiguring CodeTantra SEA",
    //   body: "Preparing your test with latest configuration..."
    // }).show();
    // app.relaunch();
    // app.quit();
    return false;
  }
  return true;
}

function getAllowAccessToOtherApps() {
  return allowAccessToOtherApps;
}

module.exports = {
  configureSea,
  getAllowAccessToOtherApps
};
