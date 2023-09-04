// import sysInfo from 'systeminformation';

const sysInfo = require("systeminformation");

async function getPlatformInfoRaw() {
  const osInfo = await sysInfo.osInfo();
  const systemInfo = await sysInfo.system();
  return {
    osInfo,
    systemInfo
  };
}

module.exports = {
  getPlatformInfoRaw
};
