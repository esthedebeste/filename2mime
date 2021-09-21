import { deepStrictEqual } from "assert";
import defaultMime, {
  lookup as mjsLookup,
  mime as mjsMime,
} from "filename2mime";
import { readFileSync } from "fs";
import { createRequire } from "module";
/**
 * Create a cjs-like require() function to test cjs interop.
 */
const require = createRequire(import.meta.url);
const cjs = require("filename2mime");
const { mime: cjsMime, lookup: cjsLookup } = cjs;

const mime = JSON.parse(
  readFileSync(new URL("../generate/mime.json", import.meta.url))
);
deepStrictEqual(
  defaultMime,
  mime,
  "Mime not equivalent to source. (module/default)"
);
deepStrictEqual(
  mjsMime,
  mime,
  "Mime not equivalent to source. (module/export)"
);
deepStrictEqual(
  cjsMime,
  mime,
  "Mime not equivalent to source. (cjs/exports.mime)"
);

deepStrictEqual(
  cjsLookup("/path/to/a/file.txt"),
  mime["txt"],
  "Lookup issue (cjs/exports.lookup)"
);
deepStrictEqual(
  mjsLookup("/path/to/a/file.txt"),
  mime["txt"],
  "Lookup issue (module/lookup)"
);

console.log("Tests passed");
