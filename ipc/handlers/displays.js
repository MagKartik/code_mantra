// import { screen } from 'electron';
// import { exec } from 'child_process';
// import log from "electron-log";
// import { getAllowAccessToOtherApps } from './configure';

const { screen } = require("electron");
const { exec } = require("child_process");
const log = require("electron-log");
const { getAllowAccessToOtherApps } = require("./configure");

const logger = log.scope("displays");

const win32 = process.platform === "win32";
let displaySwitched = false;

function cleanup() {
  if (displaySwitched) {
    exec("displayswitch.exe /internal", (err) => {
      err instanceof Error
        ? logger.error(err)
        : logger.error(`win32: ${JSON.stringify(err)}`);
    });
  }
}

function displays() {
  if (win32 && !getAllowAccessToOtherApps()) {
    displaySwitched = true;
    exec("displayswitch.exe /extend", (err) => {
      displaySwitched = false;
      err instanceof Error
        ? logger.error(err)
        : logger.error(`win32: ${JSON.stringify(err)}`);
    });
  }
  const allDisplays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const pd = allDisplays.find((d) => d.id === primaryDisplay.id);
  if (pd) {
    pd.primary = true;
  } else {
    allDisplays.push(primaryDisplay);
    primaryDisplay.primary = true;
  }
  return { type: "displays", list: allDisplays };
}

module.exports = {
  cleanup,
  displays
};
