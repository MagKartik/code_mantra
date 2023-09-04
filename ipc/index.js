// import {ipcMain} from 'electron';
// import log from "electron-log";

// import home from "./handlers/home";
// import isN from "./handlers/is-n";
// import vm from "./handlers/vm";
// import poweroff from "./handlers/poweroff";
// import configureSea from "./handlers/configure";
// import {cleanup as cleanupDisplays, displays} from "./handlers/displays";
// import perms from "./handlers/perms";
// import top from "./handlers/top";
// import {
//     blacklistedProcessList,
//     cleanupProcessList,
//     forceKillBlacklistedProcesses,
//     setBlacklist
// } from "./handlers/process-list";
// import {getAppVersion} from "./handlers/version";
// import {getPlatformInfoRaw} from "./handlers/osSupport";
// import {refreshPage} from "./handlers/refresh";
// import {checkNetworkStatus} from "./handlers/network";
// import {ensureUpdate} from "./handlers/update";
// import {showDialog} from './handlers/dialog';

const { ipcMain } = require("electron");
const log = require("electron-log");

const home = require("./handlers/home");
const isN = require("./handlers/is-n");
const vm = require("./handlers/vm");
const poweroff = require("./handlers/poweroff");
const { configureSea } = require("./handlers/configure");
const { cleanup: cleanupDisplays, displays } = require("./handlers/displays");
const perms = require("./handlers/perms");
const top = require("./handlers/top");
const {
  blacklistedProcessList,
  cleanupProcessList,
  forceKillBlacklistedProcesses,
  setBlacklist
} = require("./handlers/process-list");
const { getAppVersion } = require("./handlers/version");
const { getPlatformInfoRaw } = require("./handlers/osSupport");
const { refreshPage } = require("./handlers/refresh");
const { checkNetworkStatus } = require("./handlers/network");
const { ensureUpdate } = require("./handlers/update");
const { showDialog } = require("./handlers/dialog");

const logger = log.scope("ipc");

const handlers = new Map();
handlers.set("is-n", isN);
handlers.set("home", home);
handlers.set("poweroff", poweroff);
handlers.set("displays", displays);
handlers.set("pslist", blacklistedProcessList);
handlers.set("set-pslist", setBlacklist);
handlers.set("fkill", forceKillBlacklistedProcesses);
handlers.set("configSea", configureSea);
handlers.set("vm", vm);
handlers.set("perms", perms);
handlers.set("version", getAppVersion);
handlers.set("refresh", refreshPage);
handlers.set("network", checkNetworkStatus);
handlers.set("update", ensureUpdate);
handlers.set("top", top);
handlers.set("platform-info", getPlatformInfoRaw);
handlers.set("show-dialog", showDialog);

const unregisterWebEventHandlers = async function () {
  logger.info("unregisterWebEventHandlers");
  await cleanupProcessList();
  cleanupDisplays();
};

const registerWebEventHandlers = function () {
  logger.info("registerWebEventHandlers");
  ipcMain.on("ct-msg", (event, msg) => {
    const { type, payload } = msg;
    logger.info("ct-msg", type, payload);
    const h = handlers.get(type);
    if (h) {
      Promise.resolve(h(payload))
        .then((response) => {
          event.returnValue = response;
        })
        .catch((reason) => {
          event.returnValue =
            reason && reason.error
              ? reason
              : { error: JSON.stringify(reason), msg };
        });
    } else {
      event.returnValue = { error: "Handler not found", msg };
    }
  });
};

module.exports = {
  unregisterWebEventHandlers,
  registerWebEventHandlers
};
