import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  codeLanguageEnum,
  roastModeEnum,
  submissionVisibilityEnum,
} from "./enums";

export const submissions = pgTable("submissions", {
  id: uuid().defaultRandom().primaryKey(),
  code: text().notNull(),
  language: codeLanguageEnum().notNull().default("unknown"),
  lineCount: integer().notNull(),
  roastMode: roastModeEnum().notNull().default("normal"),
  visibility: submissionVisibilityEnum().notNull().default("public"),
  fingerprint: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
