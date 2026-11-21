# NoteQuest API

Express + MongoDB backend for **notequest.in** (public site) and **notequest-crm** (admin CRM).

## Run locally

```bash
cp .env.example .env          # set JWT_SECRET (and MONGODB_URI if not local)
npm install
npm run dev                   # http://localhost:5050  (auto-restarts on changes)
npm run create-admin -- you@example.com "a-strong-password" "Your Name"
```

Requires Node 20.6+ and MongoDB (local `mongod` or a MongoDB Atlas URI).
On start-up the API seeds the starter blog articles (if there are none) and adds any **courses and lessons** from
`src/data/curriculum/` that don't exist yet: 8 subjects, 45 lessons. Existing records are never overwritten, so edits made in the CRM are safe.

> Port 5000 is avoided on purpose: macOS uses it for AirPlay Receiver.

## Structure

```
src/
  server.js              connect DB, seed, listen
  app.js                 express app: helmet, cors, json, cookies, routes, errors
  config/                env + mongoose connection
  models/                User (+ interests, daily goal), Subject, Lesson, LessonProgress,
                         Post, Note (sticky colour, quote, source), Enrollment (path progress), Event
  middleware/            auth (JWT cookie or Bearer), upload (multer), error handling
  controllers/           auth, learning, dashboard, posts, notes, paths, track, admin, adminLearning
  routes/index.js        every endpoint in one place
  data/                  curriculum/ (lesson content), subjects.js, studyPaths.js, seedPosts.js
scripts/                 seed.js, createAdmin.js
uploads/                 article cover images (served at /uploads/*)
```

## Auth

`POST /api/auth/login` sets an httpOnly `nq_token` cookie **and** returns `{ user, token }`.
Requests are authenticated by `Authorization: Bearer <token>` or the cookie.
The website proxies `/api/*` through Next.js rewrites so the cookie stays first-party;
the CRM keeps the token in its own cookie and sends it as a Bearer token from the server.

## Endpoints

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` · `/login` · `/logout` | anyone | account + session (`login` accepts `adminOnly: true`) |
| GET | `/api/auth/me` | anyone | current user or `null` |
| PATCH | `/api/auth/me` | user | name, `interests`, `dailyGoal`, `onboarded` |
| GET | `/api/subjects` · `/api/subjects/:slug` | anyone | courses; one course with modules and lessons |
| GET | `/api/subjects/:slug/lessons/:lesson` | anyone | lesson content, prev/next, outline |
| POST | `/api/subjects/:slug/lessons/:lesson/complete` | user | toggle lesson completion |
| GET | `/api/learning?subject=` | user | completed lessons |
| GET | `/api/me/dashboard` | user | streak, daily goal, continue lesson, balanced recommendations, heatmap, notes, paths |
| GET | `/api/posts?category=&q=&featured=` | anyone | published articles |
| GET | `/api/posts/categories` · `/api/posts/:slug` | anyone | categories, one article |
| GET | `/api/paths` | anyone | study paths and their steps |
| POST | `/api/track` | anyone | `page_view`, `article_view`, `lesson_view`, `note_downloaded` events |
| GET/POST | `/api/notes?source=&sourcePrefix=&type=` | user | list / create own notes (sticky colour, quote, source) |
| GET/PATCH/DELETE | `/api/notes/:id` | user | own note |
| GET | `/api/progress` | user | all study path progress |
| GET | `/api/paths/:slug/progress` | user | progress on one path |
| POST | `/api/paths/:slug/start` · `/steps/:index/toggle` | user | enroll, tick a step |
| GET | `/api/admin/overview` | admin | KPIs, 14-day series, top articles/pages, paths, recent activity |
| GET | `/api/admin/paths` | admin | per-path learners, completion, step funnel |
| GET/PATCH/DELETE | `/api/admin/users[/:id]` | admin | users with counts; full profile (notes, progress, activity); change role; delete |
| GET/POST/PUT/DELETE | `/api/admin/posts[/:id]` | admin | manage articles (drafts included) |
| POST | `/api/admin/uploads` | admin | multipart `image` (≤ 5 MB) → `{ url }` |
| GET/DELETE | `/api/admin/notes[/:id]` | admin | all notes, searchable |
| GET | `/api/admin/events?type=&user=&anonymous=` | admin | interaction log |
| GET/POST/PUT/DELETE | `/api/admin/subjects[/:slug]` | admin | manage courses, with learners / completions / interest / notes counts |
| POST/GET/PUT/DELETE | `/api/admin/lessons[/:id]` | admin | manage lessons (`POST /:id/move` reorders) |

## Interactions recorded

`page_view`, `article_view`, `signup`, `login`, `note_created`, `note_updated`, `note_deleted`,
`note_downloaded`, `path_started`, `step_completed`, `step_uncompleted`, `path_completed`, `lesson_view`,
`lesson_completed`, `lesson_uncompleted`, `onboarded`.
Anonymous visitors get a random `nq_vid` cookie; their history is attached to their account when they sign up or log in.

## Production notes

- Set a long random `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_ORIGINS`, and `COOKIE_DOMAIN` if the API is on a subdomain.
- `uploads/` is local disk: use a persistent volume, or swap `middleware/upload.js` for S3/Cloudinary.
- Study paths live in `src/data/studyPaths.js`, a copy of `notequest.in/data/studyPaths.js`. Keep the two in sync, or move paths into MongoDB later.
  The lessons that teach each path step are mapped in `notequest.in/data/pathLessons.js`.
