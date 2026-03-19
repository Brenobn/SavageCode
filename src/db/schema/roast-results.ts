import { sql } from "drizzle-orm";
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { analysisStatusEnum, roastVerdictEnum } from "./enums";
import { submissions } from "./submissions";

export const roastResults = pgTable(
  "roast_results",
  {
    id: uuid().defaultRandom().primaryKey(),
    submissionId: uuid()
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" })
      .unique(),
    status: analysisStatusEnum().notNull().default("pending"),
    score: numeric({ precision: 3, scale: 1 }),
    verdict: roastVerdictEnum(),
    roastQuote: text(),
    model: text(),
    errorMessage: text(),
    completedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("roast_results_score_idx").on(table.score),
    check(
      "roast_results_score_range_ck",
      sql`${table.score} >= 0 AND ${table.score} <= 10`,
    ),
    check(
      "roast_results_completed_fields_ck",
      sql`${table.status} <> 'completed' OR (${table.score} IS NOT NULL AND ${table.verdict} IS NOT NULL)`,
    ),
  ],
);
