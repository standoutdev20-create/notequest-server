import { Post } from "../models/Post.js";
import seedPosts from "../data/seedPosts.js";
import { Subject } from "../models/Subject.js";
import { Lesson } from "../models/Lesson.js";
import { subjects as seedSubjects } from "../data/subjects.js";
import { curriculum } from "../data/curriculum/index.js";

/** Insert the starter articles if the posts collection is empty. */
export async function seedPostsIfEmpty() {
  if ((await Post.estimatedDocumentCount()) > 0) return 0;
  const docs = seedPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    author: p.author,
    image: p.image,
    content: p.content || [],
    featured: Boolean(p.featured),
    status: "published",
    publishedAt: Number.isNaN(new Date(p.date).getTime()) ? new Date() : new Date(p.date),
  }));
  await Post.insertMany(docs);
  return docs.length;
}

/**
 * Insert any starter subjects and lessons that don't exist yet.
 * Existing records are never overwritten, so CRM edits are safe.
 */
export async function seedCurriculum() {
  let subjects = 0;
  let lessons = 0;
  for (const [order, s] of seedSubjects.entries()) {
    const res = await Subject.updateOne(
      { slug: s.slug },
      {
        $setOnInsert: {
          slug: s.slug,
          title: s.title,
          description: s.description,
          overview: s.overview,
          image: s.image,
          level: s.level,
          duration: s.duration,
          color: s.color,
          order,
          whatYouLearn: s.whatYouLearn || [],
          skills: s.skills || [],
          careerPaths: s.careerPaths || [],
          status: "published",
        },
      },
      { upsert: true }
    );
    subjects += res.upsertedCount;

    for (const [i, l] of (curriculum[s.slug] || []).entries()) {
      const r = await Lesson.updateOne(
        { subject: s.slug, slug: l.slug },
        { $setOnInsert: { ...l, subject: s.slug, order: i, status: "published" } },
        { upsert: true }
      );
      lessons += r.upsertedCount;
    }
  }
  return { subjects, lessons };
}
