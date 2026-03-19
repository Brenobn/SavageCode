import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { analysisToneEnum } from "./enums";
import { roastResults } from "./roast-results";

export const analysisFindings = pgTable(
  "analysis_findings",
  {
    id: uuid().defaultRandom().primaryKey(),
    roastResultId: uuid()
      .notNull()
      .references(() => roastResults.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    tone: analysisToneEnum().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("analysis_findings_roast_result_id_position_uk").on(
      table.roastResultId,
      table.position,
    ),
  ],
);
