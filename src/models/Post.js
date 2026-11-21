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

const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, default: "", maxlength: 500 },
    category: { type: String, default: "General", trim: true, maxlength: 60, index: true },
    author: { type: String, default: "NoteQuest", maxlength: 80 },
    image: { type: String, default: "" },
    content: { type: [sectionSchema], default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, publishedAt: -1 });

postSchema.virtual("readTime").get(function () {
  const words = (this.content || [])
    .map((s) => `${s.heading} ${(s.paragraphs || []).join(" ")} ${s.code || ""}`)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
});

postSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Post = mongoose.model("Post", postSchema);
