// import {net} from 'electron';
// import isReachable from 'is-reachable';
// import log from 'electron-log';

const { net } = require("electron");
const isReachable = require("is-reachable");
const log = require("electron-log");

const logger = log.scope("network");

async function checkNetworkStatus() {
  try {
    const reachable = await isReachable(
      "https://www.codetantra.com/0x0.txt?" + Date.now(),
      { timeout: 15000 }
    );
    !reachable && logger.info(`network.down and ${net.isOnline()}`);
    return reachable;
  } catch (err) {
    err instanceof Error
      ? logger.error(err)
      : logger.error(`check network status: ${JSON.stringify(err)}`);
    return false;
  }
}

module.exports = {
  checkNetworkStatus
};
