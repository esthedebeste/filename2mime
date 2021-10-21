import { deepStrictEqual } from "assert";
import defaultMime, {
  lookup as mjsLookup,
  mime as mjsMime,
  reverse as mjsReverse
} from "filename2mime";
import { readFileSync } from "fs";
import { createRequire } from "module";
import { exit } from "process";
/**
 * Create a cjs-like require() function to test cjs interop.
 */
const require = createRequire(import.meta.url);
const cjs = require("filename2mime");
const { mime: cjsMime, lookup: cjsLookup, reverse: cjsReverse } = cjs;

const mime = JSON.parse(
  readFileSync(new URL("../generate/mime.json", import.meta.url))
);
try {
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

  deepStrictEqual(
    cjsReverse,
    Object.fromEntries(
      Object.entries(mime).map(([key, value]) => [value, key])
    ),
    new Error("Reverse issue (cjs/reverse)")
  );
  deepStrictEqual(
    mjsReverse,
    Object.fromEntries(
      Object.entries(mime).map(([key, value]) => [value, key])
    ),
    new Error("Reverse issue (module/reverse)")
  );
  console.log("Tests passed");
} catch (e) {
  console.error(e.message);
  exit(1);
}
