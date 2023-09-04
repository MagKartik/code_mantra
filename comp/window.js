// import {app, BrowserWindow, dialog, systemPreferences} from "electron";
// import path from "path";
// import log from "electron-log";
// import env from "../env";

// import {createSplash} from "./splash";
// import createToolBar from "./toolbar";
// import {registerWebEventHandlers, unregisterWebEventHandlers} from "../ipc";
// import {registerBlacklistedKeyBoardShortcuts, unregisterBlacklistedKeyBoardShortcuts} from "./kb";
// import {checkNetworkStatus} from "../ipc/handlers/network";
// import poweroff from "../ipc/handlers/poweroff";

const {
  app,
  BrowserWindow,
  dialog,
  systemPreferences,
  screen
} = require("electron");
const path = require("path");
const log = require("electron-log");
const env = require("../env");

const { createSplash } = require("./splash");
const createToolBar = require("./toolbar");
const {
  registerWebEventHandlers,
  unregisterWebEventHandlers
} = require("../ipc");
const {
  registerBlacklistedKeyBoardShortcuts,
  unregisterBlacklistedKeyBoardShortcuts
} = require("./kb");
const { checkNetworkStatus } = require("../ipc/handlers/network");
const poweroff = require("../ipc/handlers/poweroff");
const { store } = require("./store");

const logger = log.scope("window");

let mainWindow, splashWindow;
const tbWidth = 225,
  tbHeight = 100;

function setupToolbar() {
  if (!mainWindow) {
    return;
  }
  const toolbarView = createToolBar();
  mainWindow.setBrowserView(toolbarView);
  mainWindow.setTopBrowserView(toolbarView);
  let newBounds = mainWindow.getBounds();
  toolbarView.setBounds({
    x: newBounds.width - tbWidth,
    y: newBounds.height - tbHeight,
    width: tbWidth,
    height: tbHeight
  });
  mainWindow.on("resize", function () {
    // logger.info(`win32.resize`);
    newBounds = mainWindow.getBounds();
    toolbarView.setBounds({
      x: newBounds.width - tbWidth,
      y: newBounds.height - tbHeight,
      width: tbWidth,
      height: tbHeight
    });
  });
  toolbarView.webContents.once("did-finish-load", () => {
    toolbarView.webContents.focus();
    mainWindow.webContents.once("did-finish-load", () =>
      toolbarView.webContents.focus()
    );
  });
}

const createWindow = () => {
  if (mainWindow) {
    return;
  }
  logger.info("createWindow");
  splashWindow = createSplash();
  splashWindow.on("closed", function () {
    splashWindow = null;
  });
  const darwin = process.platform === "darwin";
  // const kiosk = darwin ? !env.config.allowAccessToOtherApps : true;
  const kiosk = false; // Disable kiosk mode
  const pDisplay = screen.getPrimaryDisplay();
  const workAreaSize = pDisplay ? pDisplay.workAreaSize : {};
  const size = darwin ? workAreaSize : {};
  mainWindow = new BrowserWindow({
    backgroundColor: "#ffffff",
    show: false,
    kiosk,
    alwaysOnTop: true,
    ...size,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      // TODO super perilous
      nodeIntegrationInSubFrames: true,
      webSecurity: true,
      webviewTag: false,
      enableRemoteModule: false,
      contextIsolation: true,
      devTools: false
    }
  });
  mainWindow.removeMenu();
  if (darwin && !kiosk) {
    mainWindow.setSimpleFullScreen(true);
    mainWindow.maximize();
  }
  mainWindow.setVisibleOnAllWorkspaces(!env.config.allowAccessToOtherApps);
  // mainWindow.webContents.openDevTools({activate: true})
  mainWindow.setContentProtection(!env.config.allowScreenCapture);
  mainWindow.setAlwaysOnTop(!env.config.allowAccessToOtherApps);
  setupToolbar();
  registerWebEventHandlers();
  if (!env.config.allowAccessToOtherApps) {
    registerBlacklistedKeyBoardShortcuts();
  }
  mainWindow.once("show", () => {
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(!env.config.allowAccessToOtherApps);
    if (darwin && !kiosk) {
      mainWindow.setSimpleFullScreen(true);
    }
  });
  mainWindow.on("close", async () => {
    logger.info("createWindow.mainWindow.close");
    await unregisterWebEventHandlers();
    unregisterBlacklistedKeyBoardShortcuts();
  });
  store.set("mainWindowID", mainWindow.id);
};

function closeSplash() {
  try {
    logger.info(`splashclose`);
    splashWindow && !splashWindow.isDestroyed() && splashWindow.close();
  } catch (err) {
    err instanceof Error
      ? logger.error(err)
      : logger.error(`splashclose.catch: ${JSON.stringify(err)}`);
  }
  logger.info(`splashclosed`);
}

async function onDeeplink(url) {
  logger.info(`createWindow.onDeeplink: url==${url}`);
  const networkStatus = await checkNetworkStatus();
  if (!networkStatus) {
    logger.info(`internet disconnected`);
    closeSplash();
    poweroff({
      message:
        "Please check your internet connection. If required, please unblock this app in your firewall/antivirus settings or restart network router.",
      title: "Internet disconnected",
      force: true
    });
    return;
  }
  const mainWindow = BrowserWindow.fromId(store.get("mainWindowID"));
  mainWindow
    .loadURL(url || "https://auth.codetantra.com/a/d.jsp")
    .then(() => {
      logger.info(`createWindow.onDeeplink.load: url==${!!url}`);
      logger.debug(
        `createWindow.onDeeplink.load: url==${url} mainWindow=${!!mainWindow} loaded=${
          mainWindow && mainWindow.webContents.getURL()
        }`
      );
      logger.info(`createWindow.onDeeplink.closeSplash`);
      closeSplash();
      logger.info(`createWindow.onDeeplink.closedSplash`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        darwinMediaCheck(mainWindow);
        logger.info(`createWindow.onDeeplink.!!mainWindow`);
        mainWindow.show();
        mainWindow.restore();
        mainWindow.focus();
      }
      logger.info(`createWindow.onDeeplink.mainWindow: shown:${!!mainWindow}`);
    })
    .catch((reason) => {
      logger.info(
        `createWindow.onDeeplink.load.catch: ${reason}, ${!!mainWindow} ${
          mainWindow && mainWindow.isDestroyed()
        }`
      );
      closeSplash();
      if (reason && (reason.code === "ERR_ABORTED" || reason.errno === -3)) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          logger.info(`createWindow.onDeeplink.load.catch-3: showing`);
          mainWindow.show();
          mainWindow.restore();
          mainWindow.focus();
        } else {
          logger.info(
            `createWindow.onDeeplink.load.catch-3: ${!!mainWindow} ${
              mainWindow && mainWindow.isDestroyed()
            }`
          );
        }
        logger.info(`createWindow.onDeeplink.load.catch: shown`);
        return;
      }
      try {
        logger.error(
          `createWindow.onDeeplink.load.catch: ${JSON.stringify(reason)}`
        );
        dialog.showErrorBox("Error encountered", JSON.stringify(reason));
      } finally {
        logger.info(
          `createWindow.onDeeplink.load.catch.mainclose ${!!mainWindow} ${
            mainWindow && mainWindow.isDestroyed()
          }`
        );
        mainWindow && !mainWindow.isDestroyed() && mainWindow.close();
      }
    });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    logger.info(`win.denied: ${JSON.stringify(details)}`);
    return { action: "deny" };
  });
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      logger.error(
        `did-fail-load: ${errorCode} - ${errorDescription}, ${validatedURL}, ${isMainFrame}`
      );
      if (errorCode === -3) {
        logger.error(`did-fail-load: ignore`);
      } else {
        logger.error(`TODO: report failures`);
      }
    }
  );
}

// for testing, resetting mic and cam perms is possible using
// tccutil reset Microphone
// tccutil reset Camera
function askForPermission(mainWindow, type, cb) {
  logger.info(`askForPermission.${type}`);
  systemPreferences
    .askForMediaAccess(type)
    .then((granted) => {
      logger.info(`askForPermission.${type}.then.${granted}`);
      if (!granted) {
        logger.info(`askForPermission.${type}.then.!.msgbx`);
        dialog
          .showMessageBox(mainWindow, {
            title: "Error",
            message: `In order to use CodeTantra Secure Exam App, ${type} permission is mandatory. Please make sure to provide the permission in your System Preferences -> Security & Privacy.`,
            detail:
              "The application will be closed automatically when you click on OK. Reopen the application once you change the settings in System Preferences.",
            buttons: ["OK"]
          })
          .then(() => {
            logger.log(`onDeeplink.loadUrl.askForMediaAccess.${type}.error`);
            app.quit();
          });
      } else {
        logger.info(`${type}: accessible after grant, cb: ${typeof cb}`);
        typeof cb === "function" && cb();
      }
    })
    .catch((e) => {
      logger.info(`askForPermission.${type}.catch`);
      e instanceof Error
        ? logger.error(e)
        : logger.error(`askForPermission.catch: ${JSON.stringify(e)}`);
    });
}

function darwinMediaCheck(mainWindow) {
  if (process.platform === "darwin") {
    logger.info(`createWindow.onDeeplink.darwin`);
    if (systemPreferences.getMediaAccessStatus("camera") !== "granted") {
      logger.info(`createWindow.onDeeplink.darwin.!cam`);
      askForPermission(mainWindow, "camera", () => {
        // noinspection JSIncompatibleTypesComparison
        if (
          !systemPreferences.getMediaAccessStatus("microphone") !== "granted"
        ) {
          logger.info(`createWindow.onDeeplink.darwin.!cam`);
          askForPermission(mainWindow, "microphone");
        } else {
          logger.info("microphone: accessible");
        }
      });
    } else {
      logger.info("camera: accessible");
      // noinspection JSIncompatibleTypesComparison
      if (!systemPreferences.getMediaAccessStatus("microphone") !== "granted") {
        logger.info(`createWindow.onDeeplink.darwin.!cam`);
        askForPermission(mainWindow, "microphone");
      } else {
        logger.info("microphone: accessible");
      }
    }
  }
}

module.exports = {
  createWindow,
  onDeeplink
};
