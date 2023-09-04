// import {getMainWindow} from "../../comp/window";
// import log from 'electron-log';

const log = require("electron-log");
const { BrowserWindow } = require("electron");
const { store } = require("../../comp/store");

const logger = log.scope("refresh");

function refreshPage() {
  logger.info(`refresh page`);
  BrowserWindow.fromId(store.get("mainWindowID")).webContents.reload();
  return true;
}

module.exports = {
  refreshPage
};
