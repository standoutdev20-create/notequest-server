import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "", maxlength: 200 },
    paragraphs: { type: [String], default: [] },
    code: { type: String },
    language: { type: String, maxlength: 30 },
  },
  { _id: false }
);

/** One readable lesson inside a subject. */
const lessonSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, index: true }, // subject slug
    slug: { type: String, required: true, trim: true, maxlength: 100 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, default: "", maxlength: 500 },
    module: { type: String, default: "Lessons", trim: true, maxlength: 100 },
    order: { type: Number, default: 0 },
    duration: { type: Number, default: 10 }, // minutes
    sections: { type: [sectionSchema], default: [] },
    keyPoints: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

lessonSchema.index({ subject: 1, slug: 1 }, { unique: true });
lessonSchema.index({ subject: 1, order: 1 });

lessonSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Lesson = mongoose.model("Lesson", lessonSchema);
