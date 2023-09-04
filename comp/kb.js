// import {globalShortcut} from 'electron';
// import log from 'electron-log';

const { globalShortcut } = require("electron");
const log = require("electron-log");

const logger = log.scope("kb");

// TODO configurable
const blackListedKeyBoardShortCuts = [
  "Alt+Esc",
  "Alt+Tab",
  "Super+Tab",
  "Alt+F4",
  "Alt+`",
  "Super+D",
  "Super+G",
  "Super+P",
  "Super+R",
  "Super+Tab",
  "Super+A",
  "Super+X",
  "Super+CommandOrControl+D",
  "CommandOrControl+F4",
  "CommandOrControl+W",
  "MediaNextTrack",
  "MediaPreviousTrack",
  "MediaStop",
  "MediaPlayPause",
  "PrintScreen"
];

function registerBlacklistedKeyBoardShortcuts() {
  logger.info("registerBlacklistedKeyBoardShortcuts");
  try {
    globalShortcut.registerAll(blackListedKeyBoardShortCuts, () => {
      logger.info("Blacklisted shortcuts");
    });
  } catch (e) {
    e instanceof Error
      ? logger.error(e)
      : logger.error(`reg: ${JSON.stringify(e)}`);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function unregisterBlacklistedKeyBoardShortcuts() {
  logger.info("unregisterBlacklistedKeyBoardShortcuts");
  globalShortcut.unregisterAll();
}

module.exports = {
  registerBlacklistedKeyBoardShortcuts,
  unregisterBlacklistedKeyBoardShortcuts
};
