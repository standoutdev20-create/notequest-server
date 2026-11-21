import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Note } from "../models/Note.js";
import { Enrollment } from "../models/Enrollment.js";
import { Event, EVENT_TYPES } from "../models/Event.js";
import { studyPaths } from "../data/studyPaths.js";
import { summarize } from "./paths.controller.js";
import { badRequest, escapeRegex, HttpError, notFound, pageParams, slugify } from "../utils/http.js";
import { readSections } from "../utils/sections.js";
import { learningOverview, userLearning } from "./adminLearning.controller.js";
import { computeStreak } from "./dashboard.controller.js";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const oid = (id) => {
  if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid id");
  return new mongoose.Types.ObjectId(id);
};

/* ======================= Overview / analytics ======================= */

export async function overview(_req, res) {
  const week = daysAgo(7);
  const [
    users,
    newUsers7d,
    activeUsers7d,
    visitors7d,
    pageViews7d,
    articleViews7d,
    notes,
    notes7d,
    published,
    drafts,
    enrollments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: week } }),
    Event.distinct("user", { user: { $ne: null }, createdAt: { $gte: week } }).then((a) => a.length),
    Event.aggregate([
      { $match: { createdAt: { $gte: week } } },
      { $group: { _id: { $ifNull: [{ $toString: "$user" }, "$visitorId"] } } },
      { $count: "n" },
    ]).then((r) => r[0]?.n || 0),
    Event.countDocuments({ type: "page_view", createdAt: { $gte: week } }),
    Event.countDocuments({ type: "article_view", createdAt: { $gte: week } }),
    Note.countDocuments(),
    Note.countDocuments({ createdAt: { $gte: week } }),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Enrollment.countDocuments(),
  ]);

  // Daily series for the last 14 days.
  const since = new Date(new Date().setUTCHours(0, 0, 0, 0) - 13 * DAY);
  const byDay = (Model, match = {}) =>
    Model.aggregate([
      { $match: { ...match, createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, n: { $sum: 1 } } },
    ]).then((rows) => Object.fromEntries(rows.map((r) => [r._id, r.n])));

  const [views, signups, newNotes] = await Promise.all([
    byDay(Event, { type: "page_view" }),
    byDay(User),
    byDay(Note),
  ]);
  const daily = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(since.getTime() + i * DAY).toISOString().slice(0, 10);
    return { day, views: views[day] || 0, signups: signups[day] || 0, notes: newNotes[day] || 0 };
  });

  const [topArticles, topPages, recentUsers, recentEvents] = await Promise.all([
    Event.aggregate([
      { $match: { type: "article_view" } },
      {
        $group: {
          _id: "$target",
          views: { $sum: 1 },
          readers: { $addToSet: { $ifNull: [{ $toString: "$user" }, "$visitorId"] } },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 6 },
      { $lookup: { from: "posts", localField: "_id", foreignField: "slug", as: "post" } },
      { $project: { slug: "$_id", views: 1, readers: { $size: "$readers" }, title: { $first: "$post.title" }, _id: 0 } },
    ]),
    Event.aggregate([
      { $match: { type: "page_view", createdAt: { $gte: daysAgo(30) } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 8 },
      { $project: { path: "$_id", views: 1, _id: 0 } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(6),
    Event.find({ type: { $ne: "page_view" } }).sort({ createdAt: -1 }).limit(12).populate("user", "name email"),
  ]);

  const prev = daysAgo(14);
  const [newUsersPrev7d, pageViewsPrev7d, notesPrev7d, learning] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: prev, $lt: week } }),
    Event.countDocuments({ type: "page_view", createdAt: { $gte: prev, $lt: week } }),
    Note.countDocuments({ createdAt: { $gte: prev, $lt: week } }),
    learningOverview(),
  ]);

  res.json({
    previous: { newUsers7d: newUsersPrev7d, pageViews7d: pageViewsPrev7d, notes7d: notesPrev7d },
    learning,
    kpis: { users, newUsers7d, activeUsers7d, visitors7d, pageViews7d, articleViews7d, notes, notes7d, published, drafts, enrollments },
    daily,
    topArticles,
    topPages,
    paths: await pathStatsData(),
    recentUsers: recentUsers.map((u) => u.toPublic()),
    recentEvents: recentEvents.map(serializeEvent),
  });
}

async function pathStatsData() {
  const rows = await Enrollment.aggregate([
    {
      $group: {
        _id: "$pathSlug",
        learners: { $sum: 1 },
        finished: { $sum: { $cond: [{ $ifNull: ["$completedAt", false] }, 1, 0] } },
        steps: { $sum: { $size: "$completedSteps" } },
        lastActivityAt: { $max: "$lastActivityAt" },
      },
    },
  ]);
  const bySlug = Object.fromEntries(rows.map((r) => [r._id, r]));
  return Object.entries(studyPaths)
    .map(([slug, p]) => {
      const r = bySlug[slug] || { learners: 0, finished: 0, steps: 0 };
      const total = p.roadmap.length;
      return {
        slug,
        title: p.title,
        totalSteps: total,
        learners: r.learners,
        finished: r.finished,
        avgPercent: r.learners ? Math.round((r.steps / (r.learners * total)) * 100) : 0,
        lastActivityAt: r.lastActivityAt || null,
      };
    })
    .sort((a, b) => b.learners - a.learners);
}

export async function pathStats(_req, res) {
  const paths = await pathStatsData();
  // Step-level funnel: how many learners completed each step.
  const funnel = await Enrollment.aggregate([
    { $unwind: "$completedSteps" },
    { $group: { _id: { slug: "$pathSlug", step: "$completedSteps" }, n: { $sum: 1 } } },
  ]);
  const counts = {};
  for (const f of funnel) (counts[f._id.slug] ||= {})[f._id.step] = f.n;
  res.json({
    paths: paths.map((p) => ({
      ...p,
      steps: studyPaths[p.slug].roadmap.map((s, i) => ({ title: s.title, completed: counts[p.slug]?.[i] || 0 })),
    })),
  });
}

/* ======================= Users (CRM) ======================= */

export async function listUsers(req, res) {
  const { limit, page, skip } = pageParams(req.query);
  const filter = {};
  if (req.query.q) {
    const re = new RegExp(escapeRegex(req.query.q), "i");
    filter.$or = [{ name: re }, { email: re }];
  }
  if (req.query.role) filter.role = req.query.role;

  const sortKey = { active: { lastSeenAt: -1 }, name: { name: 1 } }[req.query.sort] || { createdAt: -1 };
  const [users, total] = await Promise.all([
    User.find(filter).sort(sortKey).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  const ids = users.map((u) => u._id);
  const [noteCounts, pathCounts, eventCounts] = await Promise.all([
    Note.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
    Enrollment.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
    Event.aggregate([
      { $match: { user: { $in: ids } } },
      {
        $group: {
          _id: "$user",
          events: { $sum: 1 },
          articles: { $sum: { $cond: [{ $eq: ["$type", "article_view"] }, 1, 0] } },
        },
      },
    ]),
  ]);
  const map = (rows, key = "n") => Object.fromEntries(rows.map((r) => [r._id.toString(), r[key]]));
  const nc = map(noteCounts), pc = map(pathCounts), ec = map(eventCounts, "events"), ac = map(eventCounts, "articles");

  res.json({
    users: users.map((u) => ({
      ...u.toPublic(),
      notes: nc[u.id] || 0,
      paths: pc[u.id] || 0,
      events: ec[u.id] || 0,
      articlesRead: ac[u.id] || 0,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function getUserDetail(req, res) {
  const id = oid(req.params.id);
  const user = await User.findById(id);
  if (!user) throw notFound("User not found");

  const [notes, enrollments, events, byType, articles] = await Promise.all([
    Note.find({ user: id }).sort({ updatedAt: -1 }),
    Enrollment.find({ user: id }).sort({ lastActivityAt: -1 }),
    Event.find({ user: id }).sort({ createdAt: -1 }).limit(100),
    Event.aggregate([{ $match: { user: id } }, { $group: { _id: "$type", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Event.aggregate([
      { $match: { user: id, type: "article_view" } },
      { $group: { _id: "$target", views: { $sum: 1 }, lastAt: { $max: "$createdAt" } } },
      { $sort: { lastAt: -1 } },
      { $lookup: { from: "posts", localField: "_id", foreignField: "slug", as: "post" } },
      { $project: { slug: "$_id", views: 1, lastAt: 1, title: { $first: "$post.title" }, _id: 0 } },
    ]),
  ]);

  const [learning, activeDays] = await Promise.all([
    userLearning(id),
    Event.aggregate([
      { $match: { user: id, type: { $ne: "page_view" } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
    ]).then((r) => r.map((x) => x._id)),
  ]);

  res.json({
    user: user.toPublic(),
    learning: { ...learning, streak: computeStreak(activeDays), activeDays: activeDays.length },
    notes,
    progress: enrollments.filter((e) => studyPaths[e.pathSlug]).map(summarize),
    events: events.map(serializeEvent),
    activity: { byType: byType.map((t) => ({ type: t._id, count: t.count })), articles },
  });
}

export async function updateUser(req, res) {
  const id = oid(req.params.id);
  const role = req.body?.role;
  if (!["user", "admin"].includes(role)) throw badRequest("Role must be 'user' or 'admin'");
  if (role === "user" && id.equals(req.user._id) && (await User.countDocuments({ role: "admin" })) <= 1) {
    throw badRequest("You are the only admin; promote someone else first.");
  }
  const user = await User.findByIdAndUpdate(id, { role }, { returnDocument: "after" });
  if (!user) throw notFound("User not found");
  res.json({ user: user.toPublic() });
}

export async function deleteUser(req, res) {
  const id = oid(req.params.id);
  if (id.equals(req.user._id)) throw badRequest("You cannot delete your own account here.");
  const user = await User.findByIdAndDelete(id);
  if (!user) throw notFound("User not found");
  const { LessonProgress } = await import("../models/LessonProgress.js");
  await Promise.all([Note.deleteMany({ user: id }), Enrollment.deleteMany({ user: id }), LessonProgress.deleteMany({ user: id }), Event.updateMany({ user: id }, { $unset: { user: 1 } })]);
  res.status(204).end();
}

/* ======================= Articles ======================= */

function readPost(body = {}) {
  const title = String(body.title || "").trim();
  if (title.length < 3) throw badRequest("Title is required (at least 3 characters).");
  const slug = slugify(body.slug || title);
  if (!slug) throw badRequest("Slug is required.");

  const content = readSections(body.content);
  if (!content.length) throw badRequest("Add at least one section with some content.");

  return {
    title,
    slug,
    excerpt: String(body.excerpt || "").trim().slice(0, 500),
    category: String(body.category || "").trim().slice(0, 60) || "General",
    author: String(body.author || "").trim().slice(0, 80) || "NoteQuest",
    image: String(body.image || "").trim(),
    content,
    featured: Boolean(body.featured),
    status: body.status === "published" ? "published" : "draft",
  };
}

async function applyPost(post, data) {
  if (await Post.exists({ slug: data.slug, _id: { $ne: post._id } })) {
    throw new HttpError(409, `Another article already uses the slug "${data.slug}".`);
  }
  post.set(data);
  if (data.status === "published" && !post.publishedAt) post.publishedAt = new Date();
  await post.save();
  if (data.featured) await Post.updateMany({ _id: { $ne: post._id } }, { featured: false });
  return post;
}

export async function listPosts(req, res) {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) filter.title = new RegExp(escapeRegex(req.query.q), "i");
  const posts = await Post.find(filter).sort({ updatedAt: -1 });
  const notesBySlug = await Note.aggregate([
    { $match: { "source.type": "article" } },
    { $group: { _id: "$source.slug", n: { $sum: 1 } } },
  ]).then((rows) => Object.fromEntries(rows.map((r) => [r._id, r.n])));
  res.json({
    posts: posts.map((p) => {
      const { content, ...rest } = p.toJSON();
      return { ...rest, sections: content.length, notes: notesBySlug[p.slug] || 0 };
    }),
  });
}

export async function getPost(req, res) {
  const post = await Post.findById(oid(req.params.id));
  if (!post) throw notFound("Article not found");
  res.json({ post });
}

export async function createPost(req, res) {
  const post = await applyPost(new Post(), readPost(req.body));
  res.status(201).json({ post });
}

export async function updatePost(req, res) {
  const post = await Post.findById(oid(req.params.id));
  if (!post) throw notFound("Article not found");
  res.json({ post: await applyPost(post, readPost(req.body)) });
}

export async function deletePost(req, res) {
  const post = await Post.findByIdAndDelete(oid(req.params.id));
  if (!post) throw notFound("Article not found");
  res.status(204).end();
}

export function uploadImage(req, res) {
  if (!req.file) throw badRequest("No image uploaded (field name must be 'image').");
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}

/* ======================= Notes ======================= */

export async function listNotes(req, res) {
  const { limit, page, skip } = pageParams(req.query, 50);
  const filter = {};
  if (req.query.user) filter.user = oid(req.query.user);
  if (req.query.source) filter["source.slug"] = String(req.query.source);
  if (req.query.q) {
    const re = new RegExp(escapeRegex(req.query.q), "i");
    const users = await User.find({ $or: [{ name: re }, { email: re }] }).select("_id");
    filter.$or = [{ title: re }, { body: re }, { user: { $in: users.map((u) => u._id) } }];
  }
  const [notes, total] = await Promise.all([
    Note.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate("user", "name email"),
    Note.countDocuments(filter),
  ]);
  res.json({
    notes: notes.map((n) => {
      const json = n.toJSON();
      return { ...json, body: undefined, preview: n.body.slice(0, 240), length: n.body.length, user: serializeUserRef(n.user) };
    }),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function getNote(req, res) {
  const note = await Note.findById(oid(req.params.id)).populate("user", "name email");
  if (!note) throw notFound("Note not found");
  res.json({ note: { ...note.toJSON(), user: serializeUserRef(note.user) } });
}

export async function deleteNote(req, res) {
  const note = await Note.findByIdAndDelete(oid(req.params.id));
  if (!note) throw notFound("Note not found");
  res.status(204).end();
}

/* ======================= Activity ======================= */

function serializeUserRef(u) {
  return u && u._id ? { id: u._id.toString(), name: u.name, email: u.email } : null;
}

function serializeEvent(e) {
  return {
    id: e._id.toString(),
    type: e.type,
    path: e.path,
    target: e.target,
    meta: e.meta,
    createdAt: e.createdAt,
    visitorId: e.visitorId,
    user: e.user && e.user._id ? serializeUserRef(e.user) : e.user ? { id: e.user.toString() } : null,
  };
}

export async function listEvents(req, res) {
  const { limit, page, skip } = pageParams(req.query, 50);
  const filter = {};
  if (req.query.type) {
    if (!EVENT_TYPES.includes(req.query.type)) throw badRequest("Unknown event type");
    filter.type = req.query.type;
  }
  if (req.query.user) filter.user = oid(req.query.user);
  if (req.query.anonymous === "true") filter.user = { $exists: false };
  const [events, total] = await Promise.all([
    Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email"),
    Event.countDocuments(filter),
  ]);
  res.json({ events: events.map(serializeEvent), total, page, pages: Math.ceil(total / limit), types: EVENT_TYPES });
}
