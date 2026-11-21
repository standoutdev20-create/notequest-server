import mongoose from "mongoose";

/** A user's progress through one study path. */
const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pathSlug: { type: String, required: true, index: true },
    completedSteps: { type: [Number], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: { createdAt: "startedAt", updatedAt: "updatedAt" } }
);

enrollmentSchema.index({ user: 1, pathSlug: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
