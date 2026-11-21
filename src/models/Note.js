import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 100_000 },
    // Sticky-note colour used across the site
    color: { type: String, enum: ["yellow", "blue", "green", "pink", "purple"], default: "yellow" },
    // Text the learner highlighted while reading, if the note started from a selection
    quote: { type: String, maxlength: 2000 },
    // Where the note was written, e.g. { type: "lesson", slug: "web-development/html-fundamentals", title: "HTML Fundamentals" }
    source: {
      type: { type: String, enum: ["article", "path", "lesson", "subject", null], default: null },
      slug: { type: String, maxlength: 120 },
      title: { type: String, maxlength: 200 },
    },
  },
  { timestamps: true }
);

noteSchema.index({ user: 1, updatedAt: -1 });

noteSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Note = mongoose.model("Note", noteSchema);
