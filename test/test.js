import { deepStrictEqual } from "assert";
import {
  default as defaultMime,
  lookup as mjsLookup,
  mime as mjsMime,
} from "filename2mime";
import { readFileSync } from "fs";
import { createRequire } from "module";
const cjs = createRequire(import.meta.url)("filename2mime");
const { mime: cjsMime, lookup: cjsLookup } = cjs;
const mime = JSON.parse(
  readFileSync(new URL("../generate/mime.json", import.meta.url))
);
deepStrictEqual(defaultMime, mime, "1");
deepStrictEqual(mjsMime, mime, "2");
deepStrictEqual(cjsMime, mime, "3");

deepStrictEqual(cjsLookup("/path/to/a/file.txt"), mime["txt"]);
deepStrictEqual(mjsLookup("/path/to/a/file.txt"), mime["txt"]);
console.log("Tests passed");
