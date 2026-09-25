const express = require("express");
const router = express.Router();
const { readAll } = require("../utils/jsonStore");
const requireAuth = require("../middleware/requireAuth");

const SATISFIED_THRESHOLD = 4;
const NEUTRAL_THRESHOLD = 2.5;

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", { month: "short" });
}

// GET /api/analytics/summary — admin only, powers the dashboard
router.get("/summary", requireAuth, (req, res) => {
  const responses = readAll("responses");
  const rated = responses.filter((r) => typeof r.overallRating === "number");

  const totalResponses = responses.length;
  const averageRating = rated.length
    ? Math.round((rated.reduce((s, r) => s + r.overallRating, 0) / rated.length) * 100) / 100
    : 0;

  const satisfiedCount = rated.filter((r) => r.overallRating >= SATISFIED_THRESHOLD).length;
  const neutralCount = rated.filter(
    (r) => r.overallRating >= NEUTRAL_THRESHOLD && r.overallRating < SATISFIED_THRESHOLD
  ).length;
  const unsatisfiedCount = rated.filter((r) => r.overallRating < NEUTRAL_THRESHOLD).length;

  const satisfiedPct = rated.length ? Math.round((satisfiedCount / rated.length) * 100) : 0;
  const neutralPct = rated.length ? Math.round((neutralCount / rated.length) * 100) : 0;
  const unsatisfiedPct = Math.max(0, 100 - satisfiedPct - neutralPct);

  const now = new Date();
  const thisMonthCount = responses.filter((r) => {
    const d = new Date(r.submittedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Build a trend of the last 7 months, oldest first
  const monthBuckets = {};
  responses.forEach((r) => {
    const key = monthKey(r.submittedAt);
    monthBuckets[key] = (monthBuckets[key] || 0) + 1;
  });

  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    trend.push({ month: monthLabel(d.toISOString()), count: monthBuckets[key] || 0 });
  }

  res.json({
    totalResponses,
    averageRating,
    satisfiedPct,
    thisMonthCount,
    trend,
    overallSatisfaction: {
      satisfied: satisfiedPct,
      neutral: neutralPct,
      unsatisfied: unsatisfiedPct,
    },
  });
});

module.exports = router;
