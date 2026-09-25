(function () {
  const loadingEl = document.getElementById("feedback-loading");
  const errorEl = document.getElementById("feedback-error");
  const tableEl = document.getElementById("feedback-table");
  const tbody = document.getElementById("feedback-tbody");
  const emptyEl = document.getElementById("feedback-empty");
  const paginationEl = document.getElementById("feedback-pagination");
  const summaryEl = document.getElementById("pagination-summary");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  let currentPage = 1;
  const pageSize = 10;

  function ratingBadgeClass(rating) {
    if (rating === null || rating === undefined) return "badge-info";
    if (rating >= 4) return "badge-success";
    if (rating >= 2.5) return "badge-warning";
    return "badge-danger";
  }

  function extractComment(response) {
    const textAnswer = response.answers.find((a) => typeof a.value === "string" && a.value.trim());
    return textAnswer ? textAnswer.value : "\u2014";
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function renderRows(items) {
    tbody.innerHTML = "";
    items.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${r.id}</td>
        <td>${formatDate(r.submittedAt)}</td>
        <td><span class="badge ${ratingBadgeClass(r.overallRating)}">${
        r.overallRating !== null ? r.overallRating.toFixed(2) : "N/A"
      }</span></td>
        <td>${escapeHtml(extractComment(r))}</td>
        <td><button type="button" class="btn btn-secondary" data-delete="${r.id}">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => handleDelete(Number(btn.dataset.delete)));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  async function handleDelete(id) {
    if (!confirm(`Delete response #${id}? This cannot be undone.`)) return;
    try {
      await ResponseService.remove(id);
      await load(currentPage);
    } catch (err) {
      errorEl.textContent = err.message || "Could not delete response.";
      errorEl.hidden = false;
    }
  }

  async function load(page) {
    loadingEl.hidden = false;
    tableEl.hidden = true;
    emptyEl.hidden = true;
    paginationEl.hidden = true;
    errorEl.hidden = true;

    try {
      const data = await ResponseService.list({ page, pageSize });
      currentPage = data.page;

      loadingEl.hidden = true;

      if (data.items.length === 0) {
        emptyEl.hidden = false;
        return;
      }

      renderRows(data.items);
      tableEl.hidden = false;

      paginationEl.hidden = false;
      const start = (data.page - 1) * data.pageSize + 1;
      const end = Math.min(data.page * data.pageSize, data.total);
      summaryEl.textContent = `Showing ${start}\u2013${end} of ${data.total} responses`;
      btnPrev.disabled = data.page <= 1;
      btnNext.disabled = data.page >= data.totalPages;
    } catch (err) {
      loadingEl.hidden = true;
      errorEl.textContent = err.message || "Could not load feedback.";
      errorEl.hidden = false;
    }
  }

  btnPrev.addEventListener("click", () => load(currentPage - 1));
  btnNext.addEventListener("click", () => load(currentPage + 1));

  load(1);
})();
