import assert from "node:assert/strict";
import test from "node:test";
import { toRoastResultViewModel } from "./roast-result-view-model";

test("maps persisted roast data into result page view model", () => {
  const vm = toRoastResultViewModel({
    code: "const x = 1",
    diffLines: [
      { content: "const x = 1", lineType: "context", position: 1 },
      { content: "var x = 1", lineType: "removed", position: 2 },
      { content: "const y = 1", lineType: "added", position: 3 },
    ],
    findings: [
      {
        description: "desc",
        id: "finding-1",
        position: 1,
        title: "title",
        tone: "critical",
      },
    ],
    language: "typescript",
    lineCount: 12,
    roastQuote: "ouch",
    score: "3.2",
    verdict: "needs_serious_help",
  });

  assert.equal(vm.score, 3.2);
  assert.equal(vm.verdictLabel, "verdict: needs_serious_help");
  assert.equal(vm.verdictTone, "critical");
  assert.equal(vm.issues.length, 1);
  assert.equal(vm.issues[0]?.id, "finding-1");
  assert.equal(vm.diffLines[0]?.variant, "context");
  assert.equal(vm.diffLines[1]?.variant, "removed");
  assert.equal(vm.diffLines[2]?.variant, "added");
});

test("maps muted findings and unknown verdict to safe labels", () => {
  const vm = toRoastResultViewModel({
    code: "",
    diffLines: [],
    findings: [
      {
        description: "nit",
        id: "finding-1",
        position: 1,
        title: "style",
        tone: "muted",
      },
    ],
    language: "unknown",
    lineCount: 0,
    roastQuote: null,
    score: null,
    verdict: null,
  });

  assert.equal(vm.score, 0);
  assert.equal(vm.verdictLabel, "verdict: needs_work");
  assert.equal(vm.verdictTone, "warning");
  assert.equal(vm.quote, "analysis unavailable");
  assert.equal(vm.issues[0]?.tone, "warning");
  assert.equal(vm.issues[0]?.label, "muted");
});
