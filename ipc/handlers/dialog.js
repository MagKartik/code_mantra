// import { dialog } from "electron";
// import { getMainWindow } from "../../comp/window";

const { dialog, BrowserWindow } = require("electron");
const { store } = require("../../comp/store");

const showDialog = async ({
  type = "info",
  title,
  message,
  buttons = ["OK"]
}) => {
  await dialog.showMessageBox(BrowserWindow.fromId(store.get("mainWindowID")), {
    type,
    title,
    message,
    buttons,
    cancelId: 0
  });
  return true;
};

module.exports = {
  showDialog
};
