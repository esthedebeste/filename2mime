import { writeFileSync } from "fs";
import db from "mime-db";
const result = {};
for (const mime in db)
  if (db[mime].extensions)
    for (const ext of db[mime].extensions) if (!result[ext]) result[ext] = mime;
const valid = string => {
  if (/^[a-zA-Z]+$/.test(string)) return true;
  if (/^\d/.test(string)) return /^[1-9]\d*$/.test(string);
  if (/-/.test(string)) return false;
  return false;
};
const shortcuts = Object.fromEntries(
  [
    "application/",
    "application/vnd.",
    "application/x-",
    "image/",
    "image/vnd.",
    "image/x-",
    "text/",
    "text/vnd.",
    "text/x-",
    "video/",
    "video/vnd.",
    "video/x-",
    "audio/",
    "audio/vnd.",
    "audio/x-",
    "model/",
    "model/vnd.",
    "chemical/",
    "chemical/x-",
    "font/",
    "message/",
    "message/vnd.",
  ].map((a, i) => [a, String.fromCharCode(97 + i)])
);
const shorter = a => {
  let longest = "";
  for (const shortcut in shortcuts)
    if (a === shortcut) continue;
    else if (a.startsWith(shortcut))
      if (shortcut.length > longest.length) longest = shortcut;
  if (longest) return `${shortcuts[longest]}+"${a.slice(longest.length)}"`;
  else return `"${a}"`;
};
const writing =
  `var ` +
  Object.entries(shortcuts)
    .map(([value, name]) => `${name}=${shorter(value)}`)
    .join(",") +
  `;module.exports={` +
  Object.entries(result)
    .sort()
    .map(([ext, value]) => `${valid(ext) ? ext : `"${ext}"`}:${shorter(value)}`)
    .join(",") +
  "}";
writeFileSync(new URL("../mime.cjs", import.meta.url), writing);
writeFileSync(new URL("./mime.json", import.meta.url), JSON.stringify(result));
