var mime = require("./mime.js"),
	rev = {}
for (var key in mime)
	if (rev[mime[key]]) rev[mime[key]].push(key)
	else rev[mime[key]] = [key]
function lookup(f) {
	return mime[f.slice(f.lastIndexOf(".") + 1)]
}
module.exports = {
	mime: mime,
	reverse: rev,
	lookup: lookup,
}
