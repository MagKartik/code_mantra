// import {app, shell} from 'electron';
// import log from 'electron-log';

const { app, shell } = require("electron");
const log = require("electron-log");

const logger = log.scope("update");

function ensureUpdate(downloadLinks) {
  const { linux, windows, mac } = downloadLinks || {};
  let url;
  logger.info(`ensureUpdate: ${JSON.stringify(downloadLinks || {})}`);
  switch (process.platform) {
    case "linux":
      url = linux;
      break;
    case "darwin":
      url = mac;
      break;
    case "win32":
      url = windows;
      break;
    default:
      logger.info(`unsupported platform: ${process.platform}`);
      return true;
  }
  if (!url) {
    logger.info(`empty`);
    return true;
  }
  logger.info(`platurl.launch: ${url}`);
  const done = shell.openExternal(url, { activate: true });
  logger.info(`quit`);
  app.quit();
  return true;
}

module.exports = {
  ensureUpdate
};
