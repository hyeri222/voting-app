// Usage: npm run db:migrate
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// The HTTP driver runs one statement per query.
for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
  await sql.query(statement);
}
console.log("Schema applied.");
