// Shared by the app and scripts/create-operator.mjs, so it stays plain JS.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/** @param {string} password @returns {Promise<string>} "salt:hash" in hex */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = /** @type {Buffer} */ (await scryptAsync(password, salt, KEY_LENGTH));
  return `${salt}:${hash.toString("hex")}`;
}

/** @param {string} password @param {string} stored @returns {Promise<boolean>} */
export async function verifyPassword(password, stored) {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = /** @type {Buffer} */ (await scryptAsync(password, salt, KEY_LENGTH));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
