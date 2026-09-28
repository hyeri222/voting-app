import "server-only";

/** Options shared by every cookie the app sets; callers add their own lifetime. */
export const secureCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const;
