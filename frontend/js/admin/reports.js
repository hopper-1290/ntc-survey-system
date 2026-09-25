(function () {
  const btn = document.getElementById("btn-export");
  const errorEl = document.getElementById("reports-error");

  async function fetchAllResponses() {
    const all = [];
    let page = 1;
    let totalPages = 1;

    do {
      const data = await ResponseService.list({ page, pageSize: 100 });
      all.push(...data.items);
      totalPages = data.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  }

  function toCsvValue(value) {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function buildCsv(responses, questions) {
    const questionMap = new Map(questions.map((q) => [q.id, q.text]));
    const header = ["ID", "Submitted At", "Overall Rating", ...questions.map((q) => q.text)];

    const rows = responses.map((r) => {
      const answerByQuestion = new Map(r.answers.map((a) => [a.questionId, a.value]));
      return [
        r.id,
        r.submittedAt,
        r.overallRating ?? "",
        ...questions.map((q) => answerByQuestion.get(q.id) ?? ""),
      ];
    });

    const lines = [header, ...rows].map((row) => row.map(toCsvValue).join(","));
    return lines.join("\n");
  }

  function downloadCsv(csv) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ntc-guest-satisfaction-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  btn.addEventListener("click", async () => {
    errorEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "Preparing export...";

    try {
      const [responses, questions] = await Promise.all([
        fetchAllResponses(),
        QuestionService.getQuestions(),
      ]);

      if (responses.length === 0) {
        throw new Error("There are no responses to export yet.");
      }

      const csv = buildCsv(responses, questions);
      downloadCsv(csv);
    } catch (err) {
      errorEl.textContent = err.message || "Could not export responses.";
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "Download CSV";
    }
  });
})();
