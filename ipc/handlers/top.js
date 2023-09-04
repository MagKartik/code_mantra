// import {getMainWindow} from "../../comp/window";
// import log from "electron-log";

const { BrowserWindow } = require("electron");
const { store } = require("../../comp/store");

const log = require("electron-log");

const logger = log.scope("top");

function top(on) {
  try {
    logger.info(`topping ${on}`);
    let mw = BrowserWindow.fromId(store.get("mainWindowID"));
    logger.info(`topping ${on} ${!!mw}`);
    if (mw) {
      if (on) {
        if (!mw.isDestroyed() && mw.isVisible()) {
          logger.info(`topping onning`);
          // mw.focus();
          // mw.setAlwaysOnTop(true);
          // mw.setContentProtection(true);
        }
      } else {
        logger.info(`topping offing`);
        // mw.setAlwaysOnTop(false);
        // mw.setContentProtection(false);
      }
    }
    logger.info(`topping done`);
  } catch (e) {
    e instanceof Error
      ? logger.error(e)
      : logger.error(`topping: ${JSON.stringify(e)}`);
  }
  return { type: "top", on };
}

module.exports = top;
