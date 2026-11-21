import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/http.js";

export const AUTH_COOKIE = "nq_token";
export const VISITOR_COOKIE = "nq_vid";

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProd,
    domain: env.cookieDomain,
    path: "/",
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

function readToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[AUTH_COOKIE] || null;
}

/** Attach req.user when a valid token is present; otherwise continue anonymously. */
export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (user) {
      req.user = user;
      // Throttled "last seen" so the CRM can show who is active.
      if (!user.lastSeenAt || Date.now() - user.lastSeenAt.getTime() > 5 * 60 * 1000) {
        User.updateOne({ _id: user._id }, { lastSeenAt: new Date() }).catch(() => {});
      }
    }
  } catch {
    // Invalid / expired token: treat as anonymous.
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in to continue."));
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Please log in to continue."));
  if (req.user.role !== "admin") return next(new HttpError(403, "Admin access required."));
  next();
}
