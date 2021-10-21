import { writeFileSync } from "fs";
import db from "mime-db";
/**
 * @type {Record<string, string>}
 */
const result = {};
// Map extensions to their mime-types
for (const mime in db)
  if (db[mime].extensions)
    for (const ext of db[mime].extensions) result[ext.toLowerCase()] ??= mime;
/**
 * Object key validity checker.
 * If this function returns true, you can leave it like { key: "value" }
 * If it returns false, { "key": "value" } is required.
 * This is used to cut down on useless bytes.
 * @param {string} name
 * @returns {boolean}
 */
const valid = name => {
  if (/^[a-zA-Z]+$/.test(name)) return true;
  if (/^\d/.test(name)) return /^[1-9]\d*$/.test(name);
  if (/-/.test(name)) return false;
  return false;
};
/**
 * Some commonly occuring starts to mime-types, to
 * short down on bytes we can execute JS at runtime to
 * do
 * var a = "text/"
 * {
 *  html: a+"html"
 * }
 */
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
    "message/vnd."
  ].map((a, i) => [a, String.fromCharCode(97 + i)])
);
/**
 * Make a shorter representation of a mime-type using the predefined {@link shortcuts}
 * @param {string} a
 * @returns {string}
 */
const shorter = a => {
  let longest = "";
  for (const shortcut in shortcuts)
    if (a === shortcut) continue;
    else if (a.startsWith(shortcut))
      if (shortcut.length > longest.length) longest = shortcut;
  if (longest) return `${shortcuts[longest]}+"${a.slice(longest.length)}"`;
  else return `"${a}"`;
};
/**
 * Instead of writing a JSON file, we create a CJS file that exports an object.
 * This way, we can optimize the JSON file using {@link shortcuts} and {@link valid}
 */
const writing =
  /**
   * Shortcut declarations, for { "html": a+"html" } instead of { "html": "text/html" }
   */
  `var ` +
  Object.entries(shortcuts)
    .map(([value, name]) => `${name}=${shorter(value)}`)
    .join(",") +
  `;module.exports={` +
  Object.entries(result)
    .sort()
    /**
     * Variable "" removal, for { html: a+"html" } instead of { "html": a+"html" }
     */
    .map(([ext, value]) => `${valid(ext) ? ext : `"${ext}"`}:${shorter(value)}`)
    .join(",") +
  "}";
/**
 * Fun fact: writeFileSync supports URLs, so this is possible
 */
writeFileSync(new URL("../mime.js", import.meta.url), writing);
/**
 * Write to generate/mime.json, this is used by test/test.js to test whether the outputted mime.js
 * is the same as the original mime data.
 */
writeFileSync(
  new URL("./mime.json", import.meta.url),
  JSON.stringify(Object.fromEntries(Object.entries(result).sort()))
);
