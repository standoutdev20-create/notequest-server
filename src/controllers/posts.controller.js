import { Post } from "../models/Post.js";
import { escapeRegex, notFound } from "../utils/http.js";

export async function listPublished(req, res) {
  const filter = { status: "published" };
  if (req.query.category) filter.category = new RegExp(`^${escapeRegex(req.query.category)}$`, "i");
  if (req.query.q) filter.title = new RegExp(escapeRegex(req.query.q), "i");
  if (req.query.featured === "true") filter.featured = true;

  const limit = Math.min(100, Number(req.query.limit) || 50);
  // Content is needed for read-time; it's small enough at this scale.
  const posts = await Post.find(filter).sort({ publishedAt: -1 }).limit(limit);
  res.json({ posts: posts.map((p) => p.toJSON()).map(({ content, ...rest }) => rest) });
}

export async function listCategories(_req, res) {
  const categories = await Post.aggregate([
    { $match: { status: "published" } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ categories: categories.map((c) => ({ name: c._id, count: c.count })) });
}

export async function getPublished(req, res) {
  const post = await Post.findOne({ slug: req.params.slug, status: "published" });
  if (!post) throw notFound("Article not found");
  res.json({ post });
}
