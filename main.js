const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const env = require("./env");
const process = require("process");
const log = require("electron-log");

const { store } = require("./comp/store");
const { createWindow } = require("./comp/window");
// const ejs = require("./comp/ejs");
const { initializeProto } = require("./comp/protocol");
const { unregisterWebEventHandlers } = require("./ipc");
const { unregisterBlacklistedKeyBoardShortcuts } = require("./comp/kb");

const logger = log.scope("main");

const relaunchUrl = store.get("relaunch");
env.config = store.get("config");
if (relaunchUrl) {
  store.delete("relaunch");
}
if (!env.config) {
  env.config = {
    allowScreenCapture: true,
    allowAccessToOtherApps: true
  };
  store.set("config", env.config);
}

logger.debug(`App settings: ${JSON.stringify(env.config)}`);

if (process.platform === "win32") {
  app.setAppUserModelId(app.name);
}

initializeProto(relaunchUrl);

app.on("ready", async () => {
  logger.info(`app.on.ready`);
  logger.debug(`App user data path: ${app.getPath("userData")}`);
  if (!app.requestSingleInstanceLock()) {
    logger.info(`app.on.ready: quitting !singleinstancelock`);
    app.quit();
    return;
  }
  logger.info(`app.on.ready.autoupdater.checking`);
  try {
    await autoUpdater.checkForUpdatesAndNotify();
  } catch (e) {
    e instanceof Error
      ? logger.error(e)
      : logger.error("app.on.ready.autoupdater: " + JSON.stringify(e));
  }
  logger.info(`app.on.ready.autoupdater.checking.done`);
  createWindow();
});

app.on("window-all-closed", () => {
  logger.info(`window-all-closed`);
  if (process.platform !== "darwin") {
    logger.info(`window-all-closed: quitting`);
    app.quit();
  }
});

app.on("will-quit", async (e) => {
  e.preventDefault();
  await unregisterWebEventHandlers();
  unregisterBlacklistedKeyBoardShortcuts();
  app.exit();
});

app.on("activate", () => {
  logger.info(`activate`);
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    logger.info(`activate: no windows`);
    if (!app.requestSingleInstanceLock()) {
      logger.info(`activate: quitting !singleinstancelock`);
      app.quit();
      return;
    }
    createWindow();
  }
});

app.on("browser-window-blur", () => {
  logger.info(`browser-window-blur`);
  logger.silly(
    "SEA just tried to prevent you from ALT+TABbing out of the app. I stopped em. :P"
  );
  // ejs('window["ipcW"] && window["ipcW"].blurSea && window["ipcW"].blurSea()');
});
