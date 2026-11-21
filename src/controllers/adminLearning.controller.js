import mongoose from "mongoose";
import { Subject } from "../models/Subject.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Note } from "../models/Note.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { badRequest, HttpError, notFound, slugify } from "../utils/http.js";
import { readList, readSections } from "../utils/sections.js";
import { groupModules } from "./learning.controller.js";

const DAY = 864e5;

function oid(id) {
  if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid id");
  return new mongoose.Types.ObjectId(id);
}

const countBy = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));

/* ---------------- Subjects ---------------- */

export async function listSubjects(_req, res) {
  const [subjects, lessons, learners, completions, interest, notes] = await Promise.all([
    Subject.find().sort({ order: 1, title: 1 }),
    Lesson.aggregate([{ $group: { _id: "$subject", n: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } } } }]),
    LessonProgress.aggregate([{ $group: { _id: { s: "$subject", u: "$user" } } }, { $group: { _id: "$_id.s", n: { $sum: 1 } } }]),
    LessonProgress.aggregate([{ $group: { _id: "$subject", n: { $sum: 1 } } }]),
    User.aggregate([{ $unwind: "$interests" }, { $group: { _id: "$interests", n: { $sum: 1 } } }]),
    Note.aggregate([
      { $match: { "source.type": "lesson" } },
      { $group: { _id: { $arrayElemAt: [{ $split: ["$source.slug", "/"] }, 0] }, n: { $sum: 1 } } },
    ]),
  ]);
  const lc = Object.fromEntries(lessons.map((r) => [r._id, r]));
  const [le, co, inn, no] = [countBy(learners), countBy(completions), countBy(interest), countBy(notes)];
  res.json({
    subjects: subjects.map((s) => ({
      ...s.toJSON(),
      lessons: lc[s.slug]?.n || 0,
      publishedLessons: lc[s.slug]?.published || 0,
      learners: le[s.slug] || 0,
      completions: co[s.slug] || 0,
      interested: inn[s.slug] || 0,
      notes: no[s.slug] || 0,
    })),
  });
}

function readSubject(body = {}) {
  const title = String(body.title || "").trim();
  if (title.length < 2) throw badRequest("Subject title is required.");
  return {
    title: title.slice(0, 120),
    slug: slugify(body.slug || title),
    description: String(body.description || "").trim().slice(0, 500),
    overview: String(body.overview || "").trim().slice(0, 3000),
    image: String(body.image || "").trim(),
    level: String(body.level || "").trim().slice(0, 60) || "Beginner to Advanced",
    duration: String(body.duration || "").trim().slice(0, 60),
    color: String(body.color || "blue").slice(0, 20),
    order: Number(body.order) || 0,
    whatYouLearn: readList(body.whatYouLearn),
    skills: readList(body.skills),
    careerPaths: readList(body.careerPaths),
    status: body.status === "draft" ? "draft" : "published",
  };
}

export async function getSubject(req, res) {
  const subject = await Subject.findOne({ slug: req.params.slug });
  if (!subject) throw notFound("Subject not found");
  const lessons = await Lesson.find({ subject: subject.slug }).select("-sections").sort({ order: 1 });
  const [views, completions, notes] = await Promise.all([
    Event.aggregate([{ $match: { type: "lesson_view", "meta.subject": subject.slug } }, { $group: { _id: "$target", n: { $sum: 1 } } }]),
    LessonProgress.aggregate([{ $match: { subject: subject.slug } }, { $group: { _id: "$lesson", n: { $sum: 1 } } }]),
    Note.aggregate([{ $match: { "source.type": "lesson", "source.slug": new RegExp(`^${subject.slug}/`) } }, { $group: { _id: "$source.slug", n: { $sum: 1 } } }]),
  ]);
  const [v, c, n] = [countBy(views), countBy(completions), countBy(notes)];
  res.json({
    subject,
    lessons: lessons.map((l) => ({
      ...l.toJSON(),
      views: v[`${subject.slug}/${l.slug}`] || 0,
      completions: c[l.slug] || 0,
      notes: n[`${subject.slug}/${l.slug}`] || 0,
    })),
  });
}

export async function createSubject(req, res) {
  const data = readSubject(req.body);
  if (await Subject.exists({ slug: data.slug })) throw new HttpError(409, `A subject with slug "${data.slug}" exists.`);
  res.status(201).json({ subject: await Subject.create(data) });
}

export async function updateSubject(req, res) {
  const subject = await Subject.findOne({ slug: req.params.slug });
  if (!subject) throw notFound("Subject not found");
  const data = readSubject(req.body);
  data.slug = subject.slug; // slug is fixed once lessons and progress point at it
  subject.set(data);
  await subject.save();
  res.json({ subject });
}

export async function deleteSubject(req, res) {
  const subject = await Subject.findOneAndDelete({ slug: req.params.slug });
  if (!subject) throw notFound("Subject not found");
  await Promise.all([Lesson.deleteMany({ subject: subject.slug }), LessonProgress.deleteMany({ subject: subject.slug })]);
  res.status(204).end();
}

/* ---------------- Lessons ---------------- */

function readLesson(body = {}) {
  const title = String(body.title || "").trim();
  if (title.length < 2) throw badRequest("Lesson title is required.");
  const sections = readSections(body.sections);
  if (!sections.length) throw badRequest("Add at least one section with content.");
  return {
    title: title.slice(0, 200),
    slug: slugify(body.slug || title),
    summary: String(body.summary || "").trim().slice(0, 500),
    module: String(body.module || "").trim().slice(0, 100) || "Lessons",
    duration: Math.min(240, Math.max(1, Number(body.duration) || 10)),
    sections,
    keyPoints: readList(body.keyPoints, 12, 300),
    status: body.status === "draft" ? "draft" : "published",
  };
}

export async function getLesson(req, res) {
  const lesson = await Lesson.findById(oid(req.params.id));
  if (!lesson) throw notFound("Lesson not found");
  res.json({ lesson });
}

export async function createLesson(req, res) {
  const subject = await Subject.findOne({ slug: String(req.body?.subject || "") });
  if (!subject) throw badRequest("Choose a valid subject.");
  const data = readLesson(req.body);
  if (await Lesson.exists({ subject: subject.slug, slug: data.slug })) throw new HttpError(409, `This subject already has a lesson "${data.slug}".`);
  const last = await Lesson.findOne({ subject: subject.slug }).sort({ order: -1 }).select("order");
  const lesson = await Lesson.create({ ...data, subject: subject.slug, order: (last?.order ?? -1) + 1 });
  res.status(201).json({ lesson });
}

export async function updateLesson(req, res) {
  const lesson = await Lesson.findById(oid(req.params.id));
  if (!lesson) throw notFound("Lesson not found");
  const data = readLesson(req.body);
  if (data.slug !== lesson.slug && (await Lesson.exists({ subject: lesson.subject, slug: data.slug }))) {
    throw new HttpError(409, `This subject already has a lesson "${data.slug}".`);
  }
  if (data.slug !== lesson.slug) {
    await LessonProgress.updateMany({ subject: lesson.subject, lesson: lesson.slug }, { lesson: data.slug });
  }
  lesson.set(data);
  await lesson.save();
  res.json({ lesson });
}

export async function moveLesson(req, res) {
  const lesson = await Lesson.findById(oid(req.params.id));
  if (!lesson) throw notFound("Lesson not found");
  const siblings = await Lesson.find({ subject: lesson.subject }).sort({ order: 1 });
  const i = siblings.findIndex((l) => l.id === lesson.id);
  const j = req.body?.direction === "up" ? i - 1 : i + 1;
  if (j >= 0 && j < siblings.length) {
    [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
    await Promise.all(siblings.map((l, order) => Lesson.updateOne({ _id: l._id }, { order })));
  }
  res.json({ ok: true });
}

export async function deleteLesson(req, res) {
  const lesson = await Lesson.findByIdAndDelete(oid(req.params.id));
  if (!lesson) throw notFound("Lesson not found");
  await LessonProgress.deleteMany({ subject: lesson.subject, lesson: lesson.slug });
  res.status(204).end();
}

/* ---------------- Learning analytics ---------------- */

export async function learningOverview() {
  const week = new Date(Date.now() - 7 * DAY);
  const prevWeek = new Date(Date.now() - 14 * DAY);
  const [completed7d, completedPrev7d, learners7d, topLessons, interests, lessonsTotal] = await Promise.all([
    LessonProgress.countDocuments({ completedAt: { $gte: week } }),
    LessonProgress.countDocuments({ completedAt: { $gte: prevWeek, $lt: week } }),
    LessonProgress.distinct("user", { completedAt: { $gte: week } }).then((a) => a.length),
    Event.aggregate([
      { $match: { type: "lesson_view" } },
      { $group: { _id: "$target", views: { $sum: 1 }, readers: { $addToSet: { $ifNull: [{ $toString: "$user" }, "$visitorId"] } } } },
      { $sort: { views: -1 } },
      { $limit: 6 },
      { $project: { target: "$_id", views: 1, readers: { $size: "$readers" }, title: { $literal: null }, _id: 0 } },
    ]),
    User.aggregate([{ $unwind: "$interests" }, { $group: { _id: "$interests", n: { $sum: 1 } } }, { $sort: { n: -1 } }]),
    Lesson.countDocuments({ status: "published" }),
  ]);
  // Attach lesson titles.
  const lessons = await Lesson.find({
    $or: topLessons.map((t) => {
      const [subject, slug] = String(t.target).split("/");
      return { subject, slug };
    }).concat([{ _id: null }]),
  }).select("subject slug title");
  const titles = Object.fromEntries(lessons.map((l) => [`${l.subject}/${l.slug}`, l.title]));
  const subjects = await Subject.find().select("slug title");
  const subjectTitles = Object.fromEntries(subjects.map((s) => [s.slug, s.title]));
  return {
    completed7d,
    completedPrev7d,
    learners7d,
    lessonsTotal,
    topLessons: topLessons.map((t) => ({ ...t, title: titles[t.target] || t.target })),
    interests: interests.map((i) => ({ slug: i._id, title: subjectTitles[i._id] || i._id, users: i.n })),
  };
}

export async function userLearning(userId) {
  const [subjects, lessons, done] = await Promise.all([
    Subject.find().sort({ order: 1 }).select("slug title"),
    Lesson.aggregate([{ $match: { status: "published" } }, { $group: { _id: "$subject", n: { $sum: 1 } } }]),
    LessonProgress.find({ user: userId }).sort({ completedAt: -1 }),
  ]);
  const totals = countBy(lessons);
  const doneBy = {};
  for (const d of done) doneBy[d.subject] = (doneBy[d.subject] || 0) + 1;
  return {
    subjects: subjects
      .map((s) => ({ slug: s.slug, title: s.title, done: doneBy[s.slug] || 0, total: totals[s.slug] || 0 }))
      .map((s) => ({ ...s, percent: s.total ? Math.round((s.done / s.total) * 100) : 0 })),
    recent: done.slice(0, 10).map((d) => ({ subject: d.subject, lesson: d.lesson, completedAt: d.completedAt })),
    lessonsCompleted: done.length,
  };
}

export { groupModules };
