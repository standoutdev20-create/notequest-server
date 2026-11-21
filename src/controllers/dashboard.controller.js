import { Subject } from "../models/Subject.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Note } from "../models/Note.js";
import { Enrollment } from "../models/Enrollment.js";
import { Event } from "../models/Event.js";
import { summarize } from "./paths.controller.js";
import { studyPaths } from "../data/studyPaths.js";

const DAY = 864e5;
// Activity that counts toward a learning streak.
const LEARNING_EVENTS = ["lesson_view", "lesson_completed", "article_view", "note_created", "note_updated", "step_completed"];

const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

export function computeStreak(activeDays) {
  const set = new Set(activeDays);
  let cursor = new Date();
  // A streak survives until the end of today even if today has no activity yet.
  if (!set.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY);
  }
  return streak;
}

/** GET /api/me/dashboard — everything the signed-in home page needs, in one call. */
export async function dashboard(req, res) {
  const user = req.user;
  const since = new Date(new Date().setUTCHours(0, 0, 0, 0) - 83 * DAY); // 12 weeks

  const [subjects, lessons, done, notes, enrollments, daily] = await Promise.all([
    Subject.find({ status: "published" }).sort({ order: 1 }).select("slug title description image color"),
    Lesson.find({ status: "published" }).select("subject slug title module order duration summary").sort({ subject: 1, order: 1 }),
    LessonProgress.find({ user: user._id }).sort({ completedAt: -1 }),
    Note.find({ user: user._id }).sort({ updatedAt: -1 }).limit(6),
    Enrollment.find({ user: user._id }).sort({ lastActivityAt: -1 }),
    Event.aggregate([
      { $match: { user: user._id, type: { $in: LEARNING_EVENTS }, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } },
    ]),
  ]);

  const doneSet = new Set(done.map((d) => `${d.subject}/${d.lesson}`));
  const bySubject = {};
  for (const l of lessons) (bySubject[l.subject] ||= []).push(l);

  const subjectProgress = subjects.map((s) => {
    const list = bySubject[s.slug] || [];
    const completed = list.filter((l) => doneSet.has(`${s.slug}/${l.slug}`)).length;
    const next = list.find((l) => !doneSet.has(`${s.slug}/${l.slug}`));
    return {
      slug: s.slug,
      title: s.title,
      description: s.description,
      image: s.image,
      color: s.color,
      total: list.length,
      done: completed,
      percent: list.length ? Math.round((completed / list.length) * 100) : 0,
      interested: user.interests.includes(s.slug),
      next: next ? { slug: next.slug, title: next.title, module: next.module, duration: next.duration, summary: next.summary } : null,
    };
  });

  // "Continue learning": the most recently viewed lesson that is not complete,
  // otherwise the next lesson after the latest completion.
  const lastView = await Event.findOne({ user: user._id, type: "lesson_view" }).sort({ createdAt: -1 });
  let continueLesson = null;
  const lessonInfo = (subjectSlug, lessonSlug) => {
    const l = (bySubject[subjectSlug] || []).find((x) => x.slug === lessonSlug);
    const s = subjects.find((x) => x.slug === subjectSlug);
    return l && s ? { subject: s.slug, subjectTitle: s.title, slug: l.slug, title: l.title, module: l.module, duration: l.duration, summary: l.summary } : null;
  };
  if (lastView?.target) {
    const [sub, les] = lastView.target.split("/");
    if (!doneSet.has(lastView.target)) continueLesson = lessonInfo(sub, les);
    else {
      const sp = subjectProgress.find((x) => x.slug === sub);
      if (sp?.next) continueLesson = lessonInfo(sub, sp.next.slug);
    }
  }

  // Balanced growth: among the learner's interests, recommend the area with the
  // least progress first so skills develop evenly.
  const focus = subjectProgress.filter((s) => s.interested);
  const pool = (focus.length ? focus : subjectProgress).filter((s) => s.next);
  const recommendations = [...pool]
    .sort((a, b) => a.percent - b.percent || a.title.localeCompare(b.title))
    .slice(0, 4)
    .map((s) => ({ subject: s.slug, subjectTitle: s.title, percent: s.percent, ...s.next }));
  if (!continueLesson && recommendations[0]) continueLesson = { ...recommendations[0], slug: recommendations[0].slug };

  const today = dayKey(new Date());
  const activity = Object.fromEntries(daily.map((d) => [d._id, d.n]));
  const heatmap = Array.from({ length: 84 }, (_, i) => {
    const day = dayKey(since.getTime() + i * DAY);
    return { day, count: activity[day] || 0 };
  });
  const lessonsToday = done.filter((d) => dayKey(d.completedAt) === today).length;
  const weekAgo = Date.now() - 7 * DAY;

  res.json({
    user: user.toPublic(),
    stats: {
      streak: computeStreak(Object.keys(activity)),
      lessonsToday,
      dailyGoal: user.dailyGoal || 1,
      lessonsCompleted: done.length,
      lessonsThisWeek: done.filter((d) => d.completedAt.getTime() >= weekAgo).length,
      minutesLearned: done.reduce((sum, d) => sum + ((bySubject[d.subject] || []).find((l) => l.slug === d.lesson)?.duration || 0), 0),
      notes: await Note.countDocuments({ user: user._id }),
      activeDays: Object.keys(activity).length,
    },
    continueLesson,
    recommendations,
    subjects: subjectProgress,
    focus: (focus.length ? focus : []).map(({ slug, title, percent, done: d, total }) => ({ slug, title, percent, done: d, total })),
    heatmap,
    notes,
    paths: enrollments.filter((e) => studyPaths[e.pathSlug]).map(summarize),
    recentlyCompleted: done.slice(0, 5).map((d) => lessonInfo(d.subject, d.lesson)).filter(Boolean),
  });
}
