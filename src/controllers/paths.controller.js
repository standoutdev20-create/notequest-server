import { Enrollment } from "../models/Enrollment.js";
import { studyPaths } from "../data/studyPaths.js";
import { badRequest, notFound } from "../utils/http.js";
import { logEvent } from "../utils/logEvent.js";

export function getPath(slug) {
  const path = studyPaths[slug];
  if (!path) throw notFound("Study path not found");
  return path;
}

/** Shape an enrollment into a progress summary. */
export function summarize(enrollment) {
  const path = studyPaths[enrollment.pathSlug];
  const total = path?.roadmap.length || 0;
  const done = enrollment.completedSteps.length;
  const nextIndex = path ? path.roadmap.findIndex((_, i) => !enrollment.completedSteps.includes(i)) : -1;
  return {
    slug: enrollment.pathSlug,
    title: path?.title || enrollment.pathSlug,
    completedSteps: [...enrollment.completedSteps].sort((a, b) => a - b),
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
    nextStep: nextIndex === -1 ? null : { index: nextIndex, title: path.roadmap[nextIndex].title },
    startedAt: enrollment.startedAt,
    lastActivityAt: enrollment.lastActivityAt,
    completedAt: enrollment.completedAt || null,
  };
}

export function listPaths(_req, res) {
  res.json({
    paths: Object.entries(studyPaths).map(([slug, p]) => ({
      slug,
      title: p.title,
      category: p.category,
      level: p.level,
      duration: p.duration,
      steps: p.roadmap.map((s) => s.title),
    })),
  });
}

export async function myProgress(req, res) {
  const enrollments = await Enrollment.find({ user: req.user._id }).sort({ lastActivityAt: -1 });
  res.json({ progress: enrollments.filter((e) => studyPaths[e.pathSlug]).map(summarize) });
}

export async function pathProgress(req, res) {
  getPath(req.params.slug);
  const enrollment = await Enrollment.findOne({ user: req.user._id, pathSlug: req.params.slug });
  res.json({ enrolled: Boolean(enrollment), progress: enrollment ? summarize(enrollment) : null });
}

async function ensureEnrollment(user, slug) {
  const existing = await Enrollment.findOne({ user: user._id, pathSlug: slug });
  if (existing) return existing;
  const created = await Enrollment.create({ user: user._id, pathSlug: slug });
  await logEvent({ user: user._id, type: "path_started", target: slug });
  return created;
}

export async function start(req, res) {
  getPath(req.params.slug);
  const enrollment = await ensureEnrollment(req.user, req.params.slug);
  res.json({ enrolled: true, progress: summarize(enrollment) });
}

export async function toggleStep(req, res) {
  const path = getPath(req.params.slug);
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= path.roadmap.length) throw badRequest("Invalid step");

  const enrollment = await ensureEnrollment(req.user, req.params.slug);
  const done = !enrollment.completedSteps.includes(index);
  enrollment.completedSteps = done
    ? [...enrollment.completedSteps, index]
    : enrollment.completedSteps.filter((i) => i !== index);
  enrollment.lastActivityAt = new Date();

  const finished = enrollment.completedSteps.length === path.roadmap.length;
  const justFinished = finished && !enrollment.completedAt;
  enrollment.completedAt = finished ? enrollment.completedAt || new Date() : undefined;
  await enrollment.save();

  await logEvent({
    user: req.user._id,
    type: done ? "step_completed" : "step_uncompleted",
    target: req.params.slug,
    meta: { step: index, title: path.roadmap[index].title },
  });
  if (justFinished) await logEvent({ user: req.user._id, type: "path_completed", target: req.params.slug });

  res.json({ enrolled: true, progress: summarize(enrollment) });
}
