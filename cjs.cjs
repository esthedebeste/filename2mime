exports.mime = require("./mime.cjs");
exports.lookup = function lookup(f) {
  f = f.split(".");
  return exports.mime[f[f.length - 1]];
};
