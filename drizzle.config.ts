import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://devroast:devroast@localhost:5432/devroast";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
});
