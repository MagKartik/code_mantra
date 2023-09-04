// import log from "electron-log";

const log = require("electron-log");

const logger = log.scope("home");

module.exports = ({ by }) => {
  logger.info(`by: ${by}`);
  return { type: "go", to: "/secure/home/tests-sea.jsp" };
};
