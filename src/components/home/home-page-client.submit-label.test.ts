import assert from "node:assert/strict";
import test from "node:test";
import { getSubmitButtonLabel, toRoastLanguage } from "./home-page-client";

test("submit button label switches during submit", () => {
  assert.equal(getSubmitButtonLabel(false), "$ roast_my_code");
  assert.equal(getSubmitButtonLabel(true), "$ roasting...");
});

test("toRoastLanguage keeps cpp mapping", () => {
  assert.equal(toRoastLanguage("cpp"), "cpp");
});
