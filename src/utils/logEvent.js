import { Event } from "../models/Event.js";

/** Record an interaction. Never throws: tracking must not break user actions. */
export async function logEvent({ user = null, visitorId = null, type, path, target, meta } = {}) {
  try {
    await Event.create({
      user: user || undefined,
      visitorId: visitorId || undefined,
      type,
      path: path ? String(path).slice(0, 300) : undefined,
      target: target ? String(target).slice(0, 200) : undefined,
      meta: meta || undefined,
    });
  } catch (err) {
    console.error("[events] failed to log", type, err.message);
  }
}
