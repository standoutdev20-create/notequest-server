import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { AUTH_COOKIE, VISITOR_COOKIE, cookieOptions, signToken } from "../middleware/auth.js";
import { badRequest, HttpError } from "../utils/http.js";
import { logEvent } from "../utils/logEvent.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/** Link anonymous browsing in this browser to the account. */
async function claimVisitorHistory(req, userId) {
  const visitorId = req.cookies?.[VISITOR_COOKIE];
  if (visitorId) await Event.updateMany({ visitorId, user: { $exists: false } }, { user: userId });
  return visitorId;
}

function issue(res, user) {
  const token = signToken(user);
  res.cookie(AUTH_COOKIE, token, cookieOptions(MAX_AGE));
  return { user: user.toPublic(), token };
}

export async function signup(req, res) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (name.length < 2) throw badRequest("Please enter your name.");
  if (!EMAIL_RE.test(email)) throw badRequest("Please enter a valid email.");
  if (password.length < 8) throw badRequest("Password must be at least 8 characters.");
  if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists.");

  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();

  const visitorId = await claimVisitorHistory(req, user._id);
  await logEvent({ user: user._id, visitorId, type: "signup" });
  res.status(201).json(issue(res, user));
}

export async function login(req, res) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await user.checkPassword(password))) throw new HttpError(401, "Incorrect email or password.");

  // The CRM only lets admins in.
  if (req.body?.adminOnly && user.role !== "admin") throw new HttpError(403, "This account does not have admin access.");

  const visitorId = await claimVisitorHistory(req, user._id);
  await logEvent({ user: user._id, visitorId, type: "login", meta: req.body?.adminOnly ? { client: "crm" } : undefined });
  res.json(issue(res, user));
}

export function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE, cookieOptions());
  res.status(204).end();
}

export function me(req, res) {
  res.json({ user: req.user ? req.user.toPublic() : null });
}

/** PATCH /api/auth/me — update name and learning profile. */
export async function updateMe(req, res) {
  const { name, interests, dailyGoal, onboarded } = req.body || {};
  const user = req.user;
  if (name !== undefined) {
    const n = String(name).trim();
    if (n.length < 2) throw badRequest("Please enter your name.");
    user.name = n.slice(0, 80);
  }
  if (interests !== undefined) {
    if (!Array.isArray(interests)) throw badRequest("Interests must be a list.");
    user.interests = [...new Set(interests.map(String))].slice(0, 12);
  }
  if (dailyGoal !== undefined) user.dailyGoal = Math.min(10, Math.max(1, Number(dailyGoal) || 1));
  const firstOnboarding = onboarded === true && !user.onboarded;
  if (onboarded !== undefined) user.onboarded = Boolean(onboarded);
  await user.save();
  if (firstOnboarding) await logEvent({ user: user._id, type: "onboarded", meta: { interests: user.interests, dailyGoal: user.dailyGoal } });
  res.json({ user: user.toPublic() });
}
