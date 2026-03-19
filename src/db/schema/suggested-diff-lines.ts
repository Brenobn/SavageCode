import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { diffLineTypeEnum } from "./enums";
import { roastResults } from "./roast-results";

export const suggestedDiffLines = pgTable(
  "suggested_diff_lines",
  {
    id: uuid().defaultRandom().primaryKey(),
    roastResultId: uuid()
      .notNull()
      .references(() => roastResults.id, { onDelete: "cascade" }),
    position: integer().notNull(),
    lineType: diffLineTypeEnum().notNull(),
    content: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("suggested_diff_lines_roast_result_id_position_uk").on(
      table.roastResultId,
      table.position,
    ),
  ],
);
