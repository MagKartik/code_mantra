// import {spawn} from 'child_process';
// import fkill from 'fkill';
// import psList from 'ps-list';
// import env from 'env';
// import log from "electron-log";

const { spawn } = require("child_process");
const fkill = require("fkill");
const psList = require("ps-list");
const env = require("../../env");
const log = require("electron-log");

const logger = log.scope("process-list");

const blacklist = {
  win32: {},
  linux: {},
  darwin: null
};

const win32 = process.platform === "win32";
const darwin = process.platform === "darwin";
let cleaningUp = false;

async function setBlacklist(psBlacklistObject) {
  blacklist.win32 = psBlacklistObject.win32
    ? psBlacklistObject.win32.reduce((a, c) => {
        a[c.toLowerCase()] = true;
        return a;
      }, {})
    : blacklist.win32;
  blacklist.linux = psBlacklistObject.linux
    ? psBlacklistObject.linux.reduce((a, c) => {
        a[c.toLowerCase()] = true;
        return a;
      }, {})
    : blacklist.linux;
  if (psBlacklistObject.darwin && psBlacklistObject.darwin.length > 0) {
    const reStr = psBlacklistObject.darwin
      .reduce((a, c) => `${a}|(${c})`, "")
      .slice(1);
    // noinspection RegExpUnnecessaryNonCapturingGroup
    blacklist.darwin = new RegExp(
      `((?:(?:${reStr})$)|(?:(?:${reStr}).app))`,
      "i"
    );
  } else {
    blacklist.darwin = null;
  }
  return true;
}

async function badPs() {
  const pls = await psList({ all: true });
  let explorerPid;
  const platformBlacklist = blacklist[process.platform] || {};
  const darwinNames = {};
  const out = pls
    .filter((p) => {
      const { name: n = "", pid, cmd = "" } = p;
      if (darwin) {
        if (!blacklist.darwin) {
          return false;
        }
        const m = cmd.match(blacklist.darwin);
        if (m) {
          darwinNames[pid] = m[1];
          return true;
        }
        return false;
      } else {
        const nlow = n.toLowerCase();
        if (platformBlacklist[nlow]) {
          return true;
        } else if (nlow === "explorer.exe") {
          explorerPid = pid;
        }
      }
    })
    .map((p) => {
      return {
        pid: p.pid,
        name: darwin ? darwinNames[p.pid] : p.name,
        cmd: p.cmd
      };
    });

  if (
    !cleaningUp &&
    explorerPid &&
    win32 &&
    (!env.config || !env.config.allowAccessToOtherApps)
  ) {
    try {
      // logger.info(`badPs fassak wm`);
      logger.info(
        `badPs tried to fassak wm, LMAO NOPE, fassak means to kill btw`
      );
      // await fkill(explorerPid, { force: true, silent: true, tree: false });
    } catch (e) {
      e instanceof Error
        ? logger.error(e)
        : logger.error(`badPs fassak wm: ${JSON.stringify(e)}`);
    }
  }

  return out;
}

async function blacklistedProcessList() {
  const outs = await badPs();
  const uniqs = Object.keys(
    outs.reduce((r, p) => {
      r[(p.name || "").toLowerCase()] = true;
      return r;
    }, {})
  );
  return { type: "pslist", list: uniqs };
}

async function cleanupProcessList() {
  cleaningUp = true;
  if (win32) {
    logger.info(`cleanupPsl.spawn`);
    try {
      const pls = await psList({ all: true });
      logger.debug(
        `cleanupPsl.spawn:gotpls: ${JSON.stringify(
          pls.filter((p) => p.name.toLowerCase() === "explorer.exe")
        )}`
      );
      if (!pls.some((p) => p.name && p.name.toLowerCase() === "explorer.exe")) {
        logger.debug(`cleanupPsl.spawn:findex`);
        const explorer = spawn("explorer.exe", {
          detached: true,
          stdio: "ignore"
        });
        logger.debug(`cleanupPsl.spawn:spex`);
        explorer.on("error", (err) => {
          logger.debug(`cleanupPsl.spawn:spexerr`);
          err instanceof Error
            ? logger.error(err)
            : logger.error(`cleanupPsl.spawn.error: ${JSON.stringify(err)}`);
        });
      } else {
        logger.debug(`cleanupPsl.spawn:!findex`);
      }
    } catch (e) {
      const explorer = spawn("explorer.exe", {
        detached: true,
        stdio: "ignore"
      });
      explorer.on("error", (err) => {
        err instanceof Error
          ? logger.error(err)
          : logger.error(`cleanupPsl.spawn.error2: ${JSON.stringify(err)}`);
      });
      e instanceof Error
        ? logger.error(e)
        : logger.error(`cleanupPsl: ${JSON.stringify(e)}`);
    }
  }
}

async function forceKillBlacklistedProcesses() {
  const pl = await badPs();
  for (const p of pl) {
    try {
      await fkill(p.pid, { force: true, silent: true, tree: false });
    } catch (e) {
      e instanceof Error
        ? logger.error(e)
        : logger.error(`black: ${JSON.stringify(e)}`);
    }
  }
  return { type: "fkill", done: true };
}

module.exports = {
  setBlacklist,
  blacklistedProcessList,
  cleanupProcessList,
  forceKillBlacklistedProcesses
};
