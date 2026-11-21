import mongoose from "mongoose";

/** A lesson a user has marked complete. */
const lessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  lesson: { type: String, required: true },
  completedAt: { type: Date, default: Date.now, index: true },
});

lessonProgressSchema.index({ user: 1, subject: 1, lesson: 1 }, { unique: true });

export const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
