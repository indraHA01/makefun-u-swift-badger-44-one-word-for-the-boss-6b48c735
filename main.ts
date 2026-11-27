// One Word for the Boss — make.fun entry
// The entry is a single fixed word: the boss who never tells you what they
// want, then acts betrayed that you didn't already know.
// No input, no network, no randomness, no dependencies.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const WORD = "mindreader";

function gate(word: string): void {
  // Gate from the competition rules: 1-30 characters, exactly one word,
  // not only whitespace.
  if (word.length < 1 || word.length > 30) {
    throw new Error(`entry must be 1-30 characters, got ${word.length}`);
  }
  if (word.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be exactly one word (no whitespace)");
  }
}

function writeEntry(word: string, outDir: string): string {
  const outPath = join(outDir, "entry.txt");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, word, "utf8");
  return outPath;
}

function verifyEntry(word: string, outPath: string): void {
  // Verify the round-trip: what landed on disk must be exactly the word,
  // so a partial or mangled write can never pass silently. The byte-length
  // check catches encoding drift that a plain string compare could miss
  // if the file were ever read back under a different encoding.
  const written = readFileSync(outPath, "utf8");
  if (written !== word) {
    throw new Error(`verification failed: entry.txt holds ${JSON.stringify(written)}`);
  }
  if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(word, "utf8")) {
    throw new Error(
      `verification failed: entry.txt is ${Buffer.byteLength(written, "utf8")} bytes, expected ${Buffer.byteLength(word, "utf8")}`,
    );
  }
  gate(written);
}

function main(): void {
  gate(WORD);
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  const outPath = writeEntry(WORD, outDir);
  verifyEntry(WORD, outPath);
  console.log(`wrote ${WORD.length}-character entry to ${outPath}`);
}

main();
