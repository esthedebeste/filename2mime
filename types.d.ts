/**
 * @param {string} f File path to parse
 * @returns A mime-type
 */
declare function lookup(f: string): string;
declare const mime: { [ext: string]: string };
declare const reverse: { [mime: string]: string[] };
export default mime;
export { mime, reverse, lookup };
