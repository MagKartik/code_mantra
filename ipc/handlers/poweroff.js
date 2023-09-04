// import {app, dialog} from 'electron';
// import {ejs, getMainWindow} from '../../comp/window';
// import log from "electron-log";

const { app, dialog, BrowserWindow } = require("electron");
const ejs = require("../../comp/ejs");
const log = require("electron-log");
const { store } = require("../../comp/store");

const logger = log.scope("poweroff");

function poweroff({ message: m = "", title = "", force = false } = {}) {
  logger.log(`handler.poweroff.messageBox.shown`);
  dialog
    .showMessageBox(BrowserWindow.fromId(store.get("mainWindowID")), {
      type: "info",
      title: title || "CodeTantra",
      message:
        m ||
        (force
          ? "The application will exit now"
          : `Are you sure you want to exit the application?`),
      detail: force
        ? "The application will exit now"
        : "Exiting the application in between the test can lead to blocking of your test. Please ignore if you have not started/completed the test.",
      buttons: force ? ["OK"] : ["Cancel", "Exit"],
      cancelId: 0
    })
    .then(({ response }) => {
      if (force || response === 1) {
        force
          ? logger.log(`handler.poweroff.messageBox.force`)
          : logger.log(`handler.poweroff.messageBox.confirm`);
        force
          ? ejs(
              'window["ipcW"] && window["ipcW"].suait({actionType: "poweroff", extraInfo: {type: "forced", m:' +
                JSON.stringify(m) +
                "}})"
            )
          : ejs(
              'window["ipcW"] && window["ipcW"].suait({actionType: "poweroff", extraInfo: {type: "confirmed", m:' +
                JSON.stringify(m) +
                "}})"
            );
        setTimeout(() => {
          app.quit();
        }, 1000);
        return { type: "poweroff", done: true };
      } else if (response === 0) {
        logger.log(`handler.poweroff.messageBox.cancel`);
        ejs(
          'window["ipcW"] && window["ipcW"].suait({actionType: "poweroff", extraInfo: {type: "cancelled", m:' +
            JSON.stringify(m) +
            "}})"
        );
        return { type: "poweroff", done: false };
      }
    });
}

module.exports = poweroff;
