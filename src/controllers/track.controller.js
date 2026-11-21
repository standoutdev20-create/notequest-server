import crypto from "node:crypto";
import { CLIENT_EVENT_TYPES } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { VISITOR_COOKIE, cookieOptions } from "../middleware/auth.js";
import { badRequest } from "../utils/http.js";
import { logEvent } from "../utils/logEvent.js";

/** POST /api/track — browser analytics (page views, article reads, note downloads). */
export async function track(req, res) {
  const { type, path, target, meta } = req.body || {};
  if (!CLIENT_EVENT_TYPES.has(type)) throw badRequest("Unsupported event type");

  let visitorId = req.cookies?.[VISITOR_COOKIE];
  if (!visitorId || !/^[a-f0-9]{32}$/.test(visitorId)) {
    visitorId = crypto.randomBytes(16).toString("hex");
    res.cookie(VISITOR_COOKIE, visitorId, cookieOptions(365 * 24 * 60 * 60 * 1000));
  }

  await logEvent({
    user: req.user?._id,
    visitorId,
    type,
    path: typeof path === "string" ? path : undefined,
    target: typeof target === "string" ? target : undefined,
    meta:
      type === "lesson_view" && typeof target === "string"
        ? { ...(meta && typeof meta === "object" ? meta : {}), subject: target.split("/")[0] }
        : meta && typeof meta === "object" && !Array.isArray(meta)
          ? meta
          : undefined,
  });

  if (type === "article_view" && typeof target === "string") {
    await Post.updateOne({ slug: target }, { $inc: { views: 1 } });
  }

  res.status(204).end();
}
