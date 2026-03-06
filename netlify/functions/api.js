const serverless = require("serverless-http");
const { app } = require("../../server/src/app");

const handler = serverless(app);

exports.handler = async (event, context) => handler(event, context);
