import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.js";
import { imageUpload } from "../middleware/upload.js";
import * as auth from "../controllers/auth.controller.js";
import * as posts from "../controllers/posts.controller.js";
import * as notes from "../controllers/notes.controller.js";
import * as paths from "../controllers/paths.controller.js";
import * as admin from "../controllers/admin.controller.js";
import * as learning from "../controllers/learning.controller.js";
import * as adminLearning from "../controllers/adminLearning.controller.js";
import { dashboard } from "../controllers/dashboard.controller.js";
import { track } from "../controllers/track.controller.js";

const router = Router();
router.use(optionalAuth);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const trackLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false });

router.get("/health", (_req, res) => res.json({ ok: true }));

/* ---------- Auth ---------- */
router.post("/auth/signup", authLimiter, auth.signup);
router.post("/auth/login", authLimiter, auth.login);
router.post("/auth/logout", auth.logout);
router.get("/auth/me", auth.me);
router.patch("/auth/me", requireAuth, auth.updateMe);

/* ---------- Public content ---------- */
router.get("/posts", posts.listPublished);
router.get("/posts/categories", posts.listCategories);
router.get("/posts/:slug", posts.getPublished);
router.get("/paths", paths.listPaths);
router.get("/subjects", learning.listSubjects);
router.get("/subjects/:slug", learning.getSubject);
router.get("/subjects/:slug/lessons/:lesson", learning.getLesson);

/* ---------- Analytics ---------- */
router.post("/track", trackLimiter, track);

/* ---------- Signed-in user ---------- */
router.get("/notes", requireAuth, notes.listMine);
router.post("/notes", requireAuth, notes.create);
router.get("/notes/:id", requireAuth, notes.getMine);
router.patch("/notes/:id", requireAuth, notes.update);
router.delete("/notes/:id", requireAuth, notes.remove);

router.get("/me/dashboard", requireAuth, dashboard);
router.get("/learning", requireAuth, learning.myLearning);
router.post("/subjects/:slug/lessons/:lesson/complete", requireAuth, learning.toggleLesson);

router.get("/progress", requireAuth, paths.myProgress);
router.get("/paths/:slug/progress", requireAuth, paths.pathProgress);
router.post("/paths/:slug/start", requireAuth, paths.start);
router.post("/paths/:slug/steps/:index/toggle", requireAuth, paths.toggleStep);

/* ---------- Admin CRM ---------- */
const a = Router();
a.use(requireAdmin);
a.get("/overview", admin.overview);
a.get("/paths", admin.pathStats);

a.get("/users", admin.listUsers);
a.get("/users/:id", admin.getUserDetail);
a.patch("/users/:id", admin.updateUser);
a.delete("/users/:id", admin.deleteUser);

a.get("/posts", admin.listPosts);
a.post("/posts", admin.createPost);
a.get("/posts/:id", admin.getPost);
a.put("/posts/:id", admin.updatePost);
a.delete("/posts/:id", admin.deletePost);
a.post("/uploads", imageUpload, admin.uploadImage);

a.get("/notes", admin.listNotes);
a.get("/notes/:id", admin.getNote);
a.delete("/notes/:id", admin.deleteNote);

a.get("/events", admin.listEvents);

a.get("/subjects", adminLearning.listSubjects);
a.post("/subjects", adminLearning.createSubject);
a.get("/subjects/:slug", adminLearning.getSubject);
a.put("/subjects/:slug", adminLearning.updateSubject);
a.delete("/subjects/:slug", adminLearning.deleteSubject);
a.post("/lessons", adminLearning.createLesson);
a.get("/lessons/:id", adminLearning.getLesson);
a.put("/lessons/:id", adminLearning.updateLesson);
a.post("/lessons/:id/move", adminLearning.moveLesson);
a.delete("/lessons/:id", adminLearning.deleteLesson);
router.use("/admin", a);

export default router;
