(function () {
  const loadingEl = document.getElementById("dashboard-loading");
  const errorEl = document.getElementById("dashboard-error");
  const contentEl = document.getElementById("dashboard-content");

  const DONUT_COLORS = {
    satisfied: "#4d8fd6",
    neutral: "#d9a441",
    unsatisfied: "#ccd4e0",
  };

  function renderStats(summary) {
    document.getElementById("stat-total").textContent = summary.totalResponses.toLocaleString();
    document.getElementById("stat-avg").textContent = `${summary.averageRating.toFixed(2)} / 5`;
    document.getElementById("stat-satisfied").textContent = `${summary.satisfiedPct}%`;
    document.getElementById("stat-month").textContent = summary.thisMonthCount.toLocaleString();

    const totalDelta = document.getElementById("stat-total-delta");
    const avgDelta = document.getElementById("stat-avg-delta");
    totalDelta.textContent = `${summary.thisMonthCount} new this month`;
    avgDelta.textContent = "Across all rated categories";
  }

  function renderBarChart(trend) {
    const container = document.getElementById("bar-chart");
    container.innerHTML = "";
    const max = Math.max(...trend.map((t) => t.count), 1);

    trend.forEach((point) => {
      const col = document.createElement("div");
      col.className = "bar-chart__col";

      const bar = document.createElement("div");
      bar.className = "bar-chart__bar";
      const heightPct = Math.max((point.count / max) * 100, 4);
      bar.style.height = `${heightPct}%`;
      bar.title = `${point.month}: ${point.count} responses`;

      const label = document.createElement("div");
      label.className = "bar-chart__label";
      label.textContent = point.month;

      col.appendChild(bar);
      col.appendChild(label);
      container.appendChild(col);
    });
  }

  function renderDonut(overall) {
    const svg = document.getElementById("donut-chart");
    const legendEl = document.getElementById("donut-legend");
    svg.innerHTML = "";
    legendEl.innerHTML = "";

    const segments = [
      { key: "satisfied", label: "Satisfied", value: overall.satisfied },
      { key: "neutral", label: "Neutral", value: overall.neutral },
      { key: "unsatisfied", label: "Unsatisfied", value: overall.unsatisfied },
    ];

    const radius = 15.9155; // makes circumference ~100 for easy percentage math
    let cumulative = 0;

    segments.forEach((seg) => {
      if (seg.value <= 0) return;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "21");
      circle.setAttribute("cy", "21");
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", "transparent");
      circle.setAttribute("stroke", DONUT_COLORS[seg.key]);
      circle.setAttribute("stroke-width", "6");
      circle.setAttribute("stroke-dasharray", `${seg.value} ${100 - seg.value}`);
      circle.setAttribute("stroke-dashoffset", `${25 - cumulative}`);
      circle.setAttribute("transform", "rotate(-90 21 21)");
      svg.appendChild(circle);
      cumulative += seg.value;

      const row = document.createElement("div");
      row.className = "donut-legend__row";
      row.innerHTML = `
        <span class="donut-legend__label">
          <span class="donut-legend__dot" style="background:${DONUT_COLORS[seg.key]}"></span>
          ${seg.label}
        </span>
        <span>${seg.value}%</span>
      `;
      legendEl.appendChild(row);
    });
  }

  async function init() {
    try {
      const summary = await AnalyticsService.getSummary();
      renderStats(summary);
      renderBarChart(summary.trend);
      renderDonut(summary.overallSatisfaction);

      loadingEl.hidden = true;
      contentEl.hidden = false;
    } catch (err) {
      loadingEl.hidden = true;
      errorEl.textContent = err.message || "Could not load dashboard data.";
      errorEl.hidden = false;
    }
  }

  init();
})();
