const express = require("express");
const router = express.Router();
const { readAll, insert, update, remove } = require("../utils/jsonStore");
const requireAuth = require("../middleware/requireAuth");

// GET /api/questions — public, used to render the survey
router.get("/", (req, res) => {
  const questions = readAll("questions").sort((a, b) => {
    if (a.categoryId !== b.categoryId) return a.categoryId - b.categoryId;
    return a.order - b.order;
  });
  res.json(questions);
});

// POST /api/questions — admin only
router.post("/", requireAuth, (req, res) => {
  const { categoryId, type, text, order } = req.body;
  if (!categoryId || !type || !text) {
    return res.status(400).json({ error: "categoryId, type, and text are required." });
  }
  const created = insert("questions", { categoryId, type, text, order: order || 1 });
  res.status(201).json(created);
});

// PUT /api/questions/:id — admin only
router.put("/:id", requireAuth, (req, res) => {
  const updated = update("questions", req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Question not found." });
  res.json(updated);
});

// DELETE /api/questions/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const ok = remove("questions", req.params.id);
  if (!ok) return res.status(404).json({ error: "Question not found." });
  res.status(204).send();
});

module.exports = router;
