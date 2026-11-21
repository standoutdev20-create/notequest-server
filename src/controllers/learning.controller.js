import { Subject } from "../models/Subject.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { notFound } from "../utils/http.js";
import { logEvent } from "../utils/logEvent.js";

const LIST_FIELDS = "subject slug title summary module order duration status";

/** Lessons grouped into modules, keeping lesson order. */
export function groupModules(lessons) {
  const modules = [];
  for (const l of lessons) {
    let m = modules.find((x) => x.title === l.module);
    if (!m) modules.push((m = { title: l.module, lessons: [] }));
    m.lessons.push(l);
  }
  return modules;
}

export async function subjectStats() {
  const rows = await Lesson.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$subject", lessons: { $sum: 1 }, minutes: { $sum: "$duration" }, modules: { $addToSet: "$module" } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, { lessons: r.lessons, minutes: r.minutes, modules: r.modules.length }]));
}

export async function listSubjects(_req, res) {
  const [subjects, stats] = await Promise.all([
    Subject.find({ status: "published" }).sort({ order: 1, title: 1 }),
    subjectStats(),
  ]);
  res.json({
    subjects: subjects.map((s) => ({ ...s.toJSON(), ...(stats[s.slug] || { lessons: 0, minutes: 0, modules: 0 }) })),
  });
}

export async function getSubject(req, res) {
  const subject = await Subject.findOne({ slug: req.params.slug, status: "published" });
  if (!subject) throw notFound("Subject not found");
  const lessons = await Lesson.find({ subject: subject.slug, status: "published" }).select(LIST_FIELDS).sort({ order: 1 });
  res.json({
    subject,
    lessons,
    modules: groupModules(lessons.map((l) => l.toJSON())),
    stats: { lessons: lessons.length, minutes: lessons.reduce((s, l) => s + l.duration, 0) },
  });
}

export async function getLesson(req, res) {
  const { slug, lesson: lessonSlug } = req.params;
  const subject = await Subject.findOne({ slug, status: "published" }).select("slug title color image");
  if (!subject) throw notFound("Subject not found");
  const lessons = await Lesson.find({ subject: slug, status: "published" }).select(LIST_FIELDS).sort({ order: 1 });
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) throw notFound("Lesson not found");
  const lesson = await Lesson.findById(lessons[index]._id);

  res.json({
    subject,
    lesson,
    position: { index, total: lessons.length },
    prev: lessons[index - 1] || null,
    next: lessons[index + 1] || null,
    modules: groupModules(lessons.map((l) => l.toJSON())),
  });
}

/* ---------------- Signed-in progress ---------------- */

export async function myLearning(req, res) {
  const filter = { user: req.user._id };
  if (req.query.subject) filter.subject = String(req.query.subject);
  const done = await LessonProgress.find(filter).sort({ completedAt: -1 });
  res.json({ completed: done.map((d) => ({ subject: d.subject, lesson: d.lesson, completedAt: d.completedAt })) });
}

export async function toggleLesson(req, res) {
  const { slug, lesson } = req.params;
  const exists = await Lesson.exists({ subject: slug, slug: lesson, status: "published" });
  if (!exists) throw notFound("Lesson not found");

  const removed = await LessonProgress.findOneAndDelete({ user: req.user._id, subject: slug, lesson });
  if (!removed) await LessonProgress.create({ user: req.user._id, subject: slug, lesson });

  await logEvent({
    user: req.user._id,
    type: removed ? "lesson_uncompleted" : "lesson_completed",
    target: `${slug}/${lesson}`,
    meta: { subject: slug },
  });

  const [completed, total] = await Promise.all([
    LessonProgress.countDocuments({ user: req.user._id, subject: slug }),
    Lesson.countDocuments({ subject: slug, status: "published" }),
  ]);
  res.json({ completed: !removed, subject: { done: completed, total, percent: total ? Math.round((completed / total) * 100) : 0 } });
}
