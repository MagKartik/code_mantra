// import {contextBridge, desktopCapturer, ipcRenderer} from 'electron';
const { contextBridge, desktopCapturer, ipcRenderer } = require("electron");

const { readFileSync } = require("fs");
const { join } = require("path");

// TODO perilous?
window.addEventListener("DOMContentLoaded", () => {
  const rendererScript = document.createElement("script");
  rendererScript.text = readFileSync(join(__dirname, "renderer.js"), "utf8");
  document.body.appendChild(rendererScript);
});

// TODO put it in ipcN and not like so
contextBridge.exposeInMainWorld("ctGetDisplayMedia", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"]
  });
  return sources[0];
});

// noinspection JSUnusedGlobalSymbols
contextBridge.exposeInMainWorld(
  "ipcN",
  Object.freeze({
    isSeaworthy: () => {
      try {
        ipcRenderer.sendSync("ct-msg", { type: "top", payload: true });
      } catch (ignore) {}
      return true;
    },
    send: (msg) => {
      return new Promise((resolve, reject) => {
        const response = ipcRenderer.sendSync("ct-msg", msg);
        if (response.error) {
          reject(response);
        } else {
          resolve(response);
        }
      });
    },
    v: () => {
      const version = ipcRenderer.sendSync("ct-msg", { type: "version" });
      console.log(`appVersion: ${version}`);
      return version;
    },
    isSeaOnly: () => {
      return true;
    },
    isSeam: () => {
      return false;
    }
  })
);
