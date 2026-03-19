import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["normal", "maximum"]);

export const analysisStatusEnum = pgEnum("analysis_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const analysisToneEnum = pgEnum("analysis_tone", [
  "critical",
  "warning",
  "good",
  "muted",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "context",
  "removed",
  "added",
]);

export const submissionVisibilityEnum = pgEnum("submission_visibility", [
  "public",
  "unlisted",
  "private",
]);

export const codeLanguageEnum = pgEnum("code_language", [
  "javascript",
  "typescript",
  "sql",
  "java",
  "python",
  "bash",
  "go",
  "rust",
  "csharp",
  "cpp",
  "php",
  "ruby",
  "unknown",
]);

export const roastVerdictEnum = pgEnum("roast_verdict", [
  "needs_serious_help",
  "needs_work",
  "decent",
  "clean",
]);
