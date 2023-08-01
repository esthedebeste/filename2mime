import { writeFileSync } from "fs"
import db from "mime-db"

/**
 * The value that will be compacted and written to mime.js. This is a map of extensions to mime-types.
 * @type {Record<string, string>}
 */
const result = {}
// Map extensions to their mime-types
for (const mime in db)
	if (db[mime].extensions)
		for (const ext of db[mime].extensions) result[ext.toLowerCase()] ??= mime
/**
 * Object key validity checker.
 * If this function returns true, you can leave it like { key: "value" }
 * If it returns false, { "key": "value" } is required.
 * This is used to cut down on useless bytes.
 * @param {string} name
 * @returns {boolean}
 */
const valid = (name) => {
	if (/^[a-zA-Z]+$/.test(name)) return true
	if (/^\d/.test(name)) return /^[1-9]\d*$/.test(name)
	if (/-/.test(name)) return false
	return false
}

/** @type {Map<string, number>} */
const bytesCutShortcutCache = new Map()
/**
 * How many bytes could we save if this string was shortcutted?
 * @param {string} shortcut
 * @returns {number}
 */
function bytesCutShortcut(shortcut) {
	if (bytesCutShortcutCache.has(shortcut))
		return bytesCutShortcutCache.get(shortcut)
	let bytes = 0
	for (const ext in result)
		if (result[ext] === shortcut) bytes += shortcut.length
		else if (result[ext].startsWith(shortcut) || result[ext].endsWith(shortcut))
			bytes += shortcut.length - 3 // aa+"html" instead of "text/html"
	bytesCutShortcutCache.set(shortcut, bytes)
	return bytes
}

/**
 * @type {Array<{ value: number, full: string, used: boolean }>}
 */
let shortcuts = []
for (const extension in result) {
	const mime = result[extension]
	for (let i = mime.length; i > 1; i--) {
		const shortcut = mime.slice(0, i)
		const bytes = bytesCutShortcut(shortcut)
		if (
			bytes >
			shortcut.length + 6 // ,aa="shortcut"
		)
			shortcuts.push({ value: bytes, full: shortcut })
	}
}
shortcuts.sort((a, b) => b.value - a.value) // Sort by value, descending
// Remove duplicates
shortcuts = shortcuts.filter(
	(a) => shortcuts.find((b) => b.full === a.full) === a
)

/**
 * Convert a number to a valid javascript identifier
 * @param {number} number
 * @returns {string}
 */
function numberToIdentifier(number) {
	const ALPHABET_FIRST = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$"
	let identifier = ""
	identifier += ALPHABET_FIRST[number % ALPHABET_FIRST.length]
	number = Math.floor(number / ALPHABET_FIRST.length)
	const ALPHABET = ALPHABET_FIRST + "_0123456789"
	while (number > 0) {
		identifier += ALPHABET[number % ALPHABET.length]
		number = Math.floor(number / ALPHABET.length)
	}
	return identifier
}

/**
 * Make a shorter representation of a mime-type using the predefined {@link shortcuts}
 * @param {string} mime
 * @param {string} [exclude] - Exclude this shortcut from being used (used when shortening shortcuts)
 * @returns {string}
 */
const shorter = (mime, exclude = undefined) => {
	let longest = undefined
	for (const shortcut of shortcuts)
		if (exclude === shortcut) break
		else if (mime.startsWith(shortcut.full))
			if (longest == null || shortcut.full.length > longest.full.length)
				longest = shortcut
	if (longest != null) {
		longest.used = true
		if (longest.full === mime)
			// { html: h } instead of { html: h+"" }
			return numberToIdentifier(shortcuts.indexOf(longest))
		return `${numberToIdentifier(shortcuts.indexOf(longest))}+"${mime.slice(
			longest.full.length
		)}"`
	} else return `"${mime}"`
}

// Shortcut all mime-types to see what shortcuts will actually be used
for (const mime of Object.values(result)) shorter(mime)
// Remove unused shortcuts
shortcuts = shortcuts.filter((a) => a.used)

/**
 * Instead of writing a JSON file, we create a CJS file that exports an object.
 * This way, we can optimize the JSON file using {@link shortcuts} and {@link valid}
 */
const writing =
	/** Shortcut declarations, for { "html": a+"html" } instead of { "html": "text/html" } */
	`var ` +
	shortcuts
		.map(
			(shortcut, i) =>
				`${numberToIdentifier(i)}=${shorter(shortcut.full, shortcut)}`
		)
		.join(",") +
	`;module.exports={` +
	Object.entries(result)
		.sort()
		/**
		 * Variable "" removal, for { html: a+"html" } instead of { "html": a+"html" }
		 */
		.map(([ext, value]) => `${valid(ext) ? ext : `"${ext}"`}:${shorter(value)}`)
		.join(",") +
	"}"

/** Fun fact: writeFileSync supports URLs, so this is possible */
writeFileSync(new URL("../mime.js", import.meta.url), writing)
/**
 * Write to generate/mime.json, this is used by test/test.js to test whether the outputted mime.js
 * is the same as the original mime data.
 */
writeFileSync(
	new URL("./mime.json", import.meta.url),
	JSON.stringify(Object.fromEntries(Object.entries(result).sort()))
)
