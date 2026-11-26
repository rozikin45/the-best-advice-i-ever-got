import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "My grandmother said: never trust a quiet room full of people nodding. Someone in there is selling something.";

// Gate from the competition rules: the entry must be 1 to 200 characters.
const MAX_CHARS = 200;

const outputPath = fileURLToPath(new URL("/output/entry.txt", import.meta.url));
const outputDir = dirname(outputPath);
mkdirSync(outputDir, { recursive: true });

// The temp file must live in the output directory itself: /output is a
// different filesystem from the entry folder, so a temp file next to
// main.ts would fail the atomic rename with EXDEV.
const tmpPath = join(outputDir, `.entry-${process.pid}.tmp`);
writeFileSync(tmpPath, LINE, "utf8");
renameSync(tmpPath, outputPath);

const back = readFileSync(outputPath, "utf8");
if (back !== LINE) throw new Error("[byte-equality] read-back differs from the entry line");
if (back.length < 1 || back.length > MAX_CHARS)
  throw new Error(`[length] entry is ${back.length} characters, outside the 1-${MAX_CHARS} gate`);
if (back.includes("\n")) throw new Error("[single-line] entry is not a single line");
if (back.trim().length === 0) throw new Error("[non-whitespace] entry is only whitespace");
for (const ch of back) {
  if (ch < " ") throw new Error(`[control-character] entry contains control character U+${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

console.log(`wrote ${back.length} characters to ${outputPath}`);
