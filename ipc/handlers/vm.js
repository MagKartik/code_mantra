// import si from 'systeminformation';
const si = require("systeminformation");

let virtual, virtualHost;
si.system().then((data) => {
  virtual = data.virtual;
  virtualHost = data.virtualHost;
});

module.exports = () => {
  return { type: "vm", v: virtual, vh: virtualHost };
};
