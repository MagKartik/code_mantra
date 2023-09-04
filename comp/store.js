// import Store from 'electron-store'
const Store = require("electron-store");

const ek = "OorikeTimepass".split("").join("R");

// Removed the encryptionKey: ek, from the store object
// config.json should be plain text now
const store = new Store({
  // encryptionKey: ek,
  clearInvalidConfig: true
});

module.exports = {
  store
};
