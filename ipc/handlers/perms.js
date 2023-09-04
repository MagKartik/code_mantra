// import { systemPreferences } from "electron";
// import log from 'electron-log';

const { systemPreferences } = require("electron");
const log = require("electron-log");

const logger = log.scope("perms");

module.exports = async function (type) {
  logger.info(`perms: ${type}`);
  if (process.platform === "darwin") {
    logger.info(`perms.darwin: ${type}`);
    if (type !== "microphone" || type !== "camera") {
      return false;
    }
    logger.info(`perms.darwin.ask: ${type}`);
    const granted = await systemPreferences.askForMediaAccess(type);
    logger.info(`perms.darwin.answer: ${type}, ${granted}`);
    return granted;
  }
  return true;
};
