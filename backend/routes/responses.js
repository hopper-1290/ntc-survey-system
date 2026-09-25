const express = require("express");
const router = express.Router();
const { readAll, insert, findById, remove } = require("../utils/jsonStore");
const requireAuth = require("../middleware/requireAuth");

// POST /api/responses — public, guests submit the survey here
router.post("/", (req, res) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "At least one answer is required." });
  }

  const numericValues = answers
    .map((a) => a.value)
    .filter((v) => typeof v === "number");

  const overallRating =
    numericValues.length > 0
      ? Math.round(
          (numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length) * 100
        ) / 100
      : null;

  const created = insert("responses", {
    submittedAt: new Date().toISOString(),
    answers,
    overallRating,
  });

  res.status(201).json({ message: "Thank you for your feedback!", response: created });
});

// GET /api/responses — admin only, paginated list (newest first)
router.get("/", requireAuth, (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 100);

  const all = readAll("responses").sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  );

  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  res.json({
    items,
    page,
    pageSize,
    total: all.length,
    totalPages: Math.ceil(all.length / pageSize),
  });
});

// GET /api/responses/:id — admin only
router.get("/:id", requireAuth, (req, res) => {
  const response = findById("responses", req.params.id);
  if (!response) return res.status(404).json({ error: "Response not found." });
  res.json(response);
});

// DELETE /api/responses/:id — admin only
router.delete("/:id", requireAuth, (req, res) => {
  const ok = remove("responses", req.params.id);
  if (!ok) return res.status(404).json({ error: "Response not found." });
  res.status(204).send();
});

module.exports = router;
