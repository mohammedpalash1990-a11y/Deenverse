import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const firestoreRules = readFileSync(resolve(process.cwd(), "firestore.rules"), "utf8");

describe("Firestore problem-report rules", () => {
  it("denies direct client access so reports must use the rate-limited API", () => {
    const marker = "match /problem_reports/{reportId} {";
    const start = firestoreRules.indexOf(marker);
    expect(start).toBeGreaterThanOrEqual(0);

    const block = firestoreRules.slice(start + marker.length).split("\n    }", 1)[0] ?? "";
    const allowStatements = (block.match(/^\s*allow\s+[^;]+;/gm) ?? [])
      .map((statement) => statement.trim());

    expect(allowStatements).toEqual(["allow read, write: if false;"]);
  });
});
