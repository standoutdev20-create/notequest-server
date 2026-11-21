import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { seedCurriculum, seedPostsIfEmpty } from "./utils/seed.js";

await connectDB();
const seeded = await seedPostsIfEmpty();
if (seeded) console.log(`[db] seeded ${seeded} starter articles`);
const cur = await seedCurriculum();
if (cur.subjects || cur.lessons) console.log(`[db] seeded ${cur.subjects} subjects and ${cur.lessons} lessons`);

createApp().listen(env.port, () => {
  console.log(`[api] NoteQuest API listening on http://localhost:${env.port}`);
});
