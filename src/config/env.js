const isProd = process.env.NODE_ENV === "production";

export const env = {
  isProd,
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/notequest",
  jwtSecret: process.env.JWT_SECRET || (isProd ? "" : "dev-only-insecure-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  // Comma-separated list of browser origins allowed to call the API directly.
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  // e.g. ".notequest.in" in production so the site and API share the login cookie.
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET must be set in production.");
}
