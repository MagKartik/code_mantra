// import {app} from 'electron';
// import log from 'electron-log'

const { app } = require("electron");
const log = require("electron-log");

const logger = log.scope("version");

function getAppVersion() {
  const version = app.getVersion();
  logger.info(`appVersion: ${version}`);
  return version;
}

module.exports = {
  getAppVersion
};
