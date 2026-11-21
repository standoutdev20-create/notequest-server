import mongoose from "mongoose";

export const EVENT_TYPES = [
  "page_view",
  "article_view",
  "signup",
  "login",
  "note_created",
  "note_updated",
  "note_deleted",
  "note_downloaded",
  "path_started",
  "step_completed",
  "step_uncompleted",
  "path_completed",
  "lesson_view",
  "lesson_completed",
  "lesson_uncompleted",
  "onboarded",
];

/** Event types the browser may send to POST /api/track. Everything else is logged server-side. */
export const CLIENT_EVENT_TYPES = new Set(["page_view", "article_view", "lesson_view", "note_downloaded"]);

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  visitorId: { type: String, index: true },
  type: { type: String, enum: EVENT_TYPES, required: true },
  path: { type: String, maxlength: 300 },
  target: { type: String, maxlength: 200 },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
});

eventSchema.index({ type: 1, createdAt: -1 });
eventSchema.index({ type: 1, target: 1 });

export const Event = mongoose.model("Event", eventSchema);
