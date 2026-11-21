import mongoose from "mongoose";

/** A subject is a course, e.g. "Web Development", made of ordered lessons. */
const subjectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 500 },
    overview: { type: String, default: "", maxlength: 3000 },
    image: { type: String, default: "" },
    level: { type: String, default: "Beginner to Advanced", maxlength: 60 },
    duration: { type: String, default: "", maxlength: 60 },
    color: { type: String, default: "blue", maxlength: 20 },
    order: { type: Number, default: 0 },
    whatYouLearn: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    careerPaths: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
  },
  { timestamps: true }
);

subjectSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Subject = mongoose.model("Subject", subjectSchema);
