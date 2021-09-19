/**
 * Looks up a file, returns a MIME type
 * @param {string} f File path to parse
 * @returns A mime-type
 */
declare function lookup(f: string): string;
declare const mime: { [ext: string]: string };
export default mime;
export { mime, lookup };
