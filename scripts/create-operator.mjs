// Usage: npm run create-operator -- <username> <password>
// Re-running with an existing username resets that operator's password.
import { neon } from "@neondatabase/serverless";
import { hashPassword } from "../lib/password.mjs";

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error("Usage: npm run create-operator -- <username> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await hashPassword(password);
await sql`
  INSERT INTO operators (username, password_hash) VALUES (${username}, ${passwordHash})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
`;
console.log(`Operator "${username}" saved.`);
