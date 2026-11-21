import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { seedCurriculum, seedPostsIfEmpty } from "../src/utils/seed.js";

await connectDB();
const n = await seedPostsIfEmpty();
console.log(n ? `Seeded ${n} articles.` : "Posts already exist; nothing to seed.");
const c = await seedCurriculum();
console.log(`Curriculum: added ${c.subjects} subjects and ${c.lessons} lessons (existing ones untouched).`);
await mongoose.disconnect();
