import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration file.
 * Datasource URL is read from DATABASE_URL env var.
 * SQLite for development — change datasource.url to a postgres:// connection
 * string and update schema.prisma provider to "postgresql" to migrate later.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
