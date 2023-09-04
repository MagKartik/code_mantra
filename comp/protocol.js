// import {app} from 'electron';
// import log from 'electron-log';
// import {getMainWindow, onDeeplink} from './window';

const { app } = require("electron");
const log = require("electron-log");
const { getMainWindow, onDeeplink } = require("./window");

const logger = log.scope("protocol");
let lastUrl;

function setDefaultProtocolClient() {
  const protoRegistered = app.isDefaultProtocolClient("codetantra");
  logger.info(`setDefaultProtocolClient: ${protoRegistered}`);
  if (!protoRegistered) {
    // Define custom protocol handler.
    // Deep linking works on packaged versions of the application!
    app.setAsDefaultProtocolClient("codetantra");
  }
}

/**
 * @description Create logic (WIN32 and Linux) for open url from protocol
 */
function setProtocolHandlerWindowsLinux(relaunchUrl) {
  // Force Single Instance Application
  const gotTheLock = app.requestSingleInstanceLock();

  app.on("second-instance", (e, argv) => {
    logger.info(`setProtoWinLin.second-instance: ${JSON.stringify(argv)}`);
    const mainWindow = getMainWindow();
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      logger.info(`setProtoWinLin.second-instance.after-launch`);
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
    app.whenReady().then(() => {
      logger.info(`setProtoWinLin.second-instance.on-launch`);
      onDeeplink(_getDeepLinkUrl(argv, relaunchUrl));
    });
  });

  if (gotTheLock) {
    app.whenReady().then(() => {
      logger.info(`setProtoWinLin.first.on-launch`);
      onDeeplink(_getDeepLinkUrl(null, relaunchUrl));
    });
  } else {
    logger.info(`setProtoWinLin: quitting !singleinstancelock`);
    app.quit();
  }
}

/**
 * @description Create logic (OSX) for open url from protocol
 */
function setProtocolHandlerOSX(relaunchUrl) {
  logger.info(`setProtoOSX: ${relaunchUrl}`);
  lastUrl = relaunchUrl;
  app.on("will-finish-launching", () => {
    logger.info("setProtoOSX.open-url.will-finish-launching");
    app.on("open-url", (event, url) => {
      logger.info(`setProtoOSX.open-url: url==${!!url}`);
      event.preventDefault();
      if (app.isReady()) {
        logger.info(`setProtoOSX.open-url.isReady: url==${!!url}`);
        onDeeplink(_getUrlToLoad(url));
      } else {
        logger.info(`setProtoOSX.open-url.!isReady: url==${!!url}`);
        app.whenReady().then(() => {
          logger.info(`setProtoOSX.open-url.!isReady.whenReady: url==${!!url}`);
          onDeeplink(_getUrlToLoad(url));
        });
      }
    });
  });
  app.on("ready", function () {
    logger.log("setProtoOSX.ready");
    onDeeplink(lastUrl);
  });
}

/**
 * @description Format url to load in mainWindow
 */
function _getUrlToLoad(url) {
  if (!url || !/codetantra:\/\/[a-zA-Z0-9-]+\.codetantra.com\b/.test(url)) {
    return "";
  }

  lastUrl = "https://" + url.split("://")[1];
  return lastUrl;
}

/**
 * @description Resolve deep link url for Win32 or Linux from process argv
 * @param argv: An array of the second instance’s (command line / deep linked) arguments
 * @param relaunchUrl: in case of relaunch, instead of picking url from argv, we pick it from config store
 */
function _getDeepLinkUrl(argv, relaunchUrl) {
  let url;
  const newArgv = argv || process.argv;
  logger.debug(JSON.stringify(newArgv));
  if (process.platform === "win32" || process.platform === "linux") {
    if (
      relaunchUrl &&
      /^(?:codetantra|https):\/\/[a-zA-Z0-9-]+\.codetantra.com\b/.test(
        relaunchUrl.trim()
      )
    ) {
      return relaunchUrl;
    }
    if (newArgv) {
      newArgv.forEach((arg) => {
        if (/codetantra:\/\/[a-zA-Z0-9-]+\.codetantra.com\b/.test(arg)) {
          url = arg;
        }
      });
      if (url) {
        return _getUrlToLoad(url);
      }
    }
    return "";
  }
}

function initializeProto(relaunchUrl) {
  logger.info("initializeProto");
  setDefaultProtocolClient();
  switch (process.platform) {
    case "darwin":
      setProtocolHandlerOSX(relaunchUrl);
      break;
    case "linux":
    case "win32":
      setProtocolHandlerWindowsLinux(relaunchUrl);
      break;
  }
}

module.exports = {
  initializeProto
};
