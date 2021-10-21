var mime = require("./mime.js");
var rev = {};
for (var key in mime) {
  rev[mime[key]] = key;
}
function lookup(f) {
  return mime[f.slice(f.lastIndexOf(".") + 1)];
}
module.exports = {
  mime: mime,
  reverse: rev,
  lookup: lookup
};
