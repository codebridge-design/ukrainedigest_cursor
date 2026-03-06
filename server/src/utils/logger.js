const info = (msg, meta) => {
  // simple logger for now
  // eslint-disable-next-line no-console
  console.log("[info]", msg, meta || "");
};

const error = (msg, err) => {
  // eslint-disable-next-line no-console
  console.error("[error]", msg, err || "");
};

module.exports = { info, error };
