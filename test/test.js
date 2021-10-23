import {
  deepStrictEqual as expectEqual,
  ok as expectTrue,
} from "assert/strict";
import defaultMime, {
  lookup as mjsLookup,
  mime as mjsMime,
  reverse as mjsReverse,
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
  expectEqual(
    defaultMime,
    mime,
    "Mime not equivalent to source. (module/default)"
  );
  expectEqual(mjsMime, mime, "Mime not equivalent to source. (module/export)");
  expectEqual(
    cjsMime,
    mime,
    "Mime not equivalent to source. (cjs/exports.mime)"
  );

  expectEqual(
    cjsLookup("/path/to/a/file.txt"),
    mime["txt"],
    "Lookup issue (cjs/exports.lookup)"
  );
  expectEqual(
    mjsLookup("/path/to/a/file.txt"),
    mime["txt"],
    "Lookup issue (module/lookup)"
  );

  for (const ext in mime)
    expectTrue(
      cjsReverse[mime[ext]].includes(ext),
      new Error("Reverse issue (cjs/reverse)")
    );
  for (const ext in mime)
    expectTrue(
      mjsReverse[mime[ext]].includes(ext),
      new Error("Reverse issue (module/reverse)")
    );
  console.log("Tests passed");
} catch (e) {
  console.error(e.message);
  exit(1);
}
