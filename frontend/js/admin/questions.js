(function () {
  const loadingEl = document.getElementById("questions-loading");
  const listEl = document.getElementById("questions-list");
  const errorEl = document.getElementById("questions-error");
  const categorySelect = document.getElementById("q-category");
  const form = document.getElementById("question-form");

  let structure = [];

  function renderList() {
    listEl.innerHTML = "";
    structure.forEach((category) => {
      const group = document.createElement("div");
      group.style.marginBottom = "1.25rem";

      const heading = document.createElement("h4");
      heading.textContent = category.name;
      heading.style.marginBottom = "0.5rem";
      heading.style.fontSize = "0.95rem";
      group.appendChild(heading);

      const ul = document.createElement("ul");
      category.questions.forEach((q) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "0.5rem 0";
        li.style.borderBottom = "1px solid var(--border-color)";
        li.style.fontSize = "0.9rem";

        const label = document.createElement("span");
        label.textContent = `${q.text} `;
        const badge = document.createElement("span");
        badge.className = "badge badge-info";
        badge.textContent = q.type === "rating" ? "Rating" : "Text";

        const wrap = document.createElement("span");
        wrap.appendChild(label);
        wrap.appendChild(badge);

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn btn-secondary";
        delBtn.textContent = "Remove";
        delBtn.style.padding = "0.35rem 0.7rem";
        delBtn.style.fontSize = "0.8rem";
        delBtn.addEventListener("click", () => handleRemove(q.id));

        li.appendChild(wrap);
        li.appendChild(delBtn);
        ul.appendChild(li);
      });

      group.appendChild(ul);
      listEl.appendChild(group);
    });
  }

  function populateCategorySelect() {
    categorySelect.innerHTML = "";
    structure.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });
  }

  async function load() {
    try {
      structure = await QuestionService.getSurveyStructure();
      loadingEl.hidden = true;
      renderList();
      populateCategorySelect();
    } catch (err) {
      loadingEl.hidden = true;
      errorEl.textContent = err.message || "Could not load questions.";
      errorEl.hidden = false;
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this question from the survey?")) return;
    try {
      await QuestionService.removeQuestion(id);
      await load();
    } catch (err) {
      errorEl.textContent = err.message || "Could not remove question.";
      errorEl.hidden = false;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;

    const categoryId = Number(categorySelect.value);
    const type = document.getElementById("q-type").value;
    const text = document.getElementById("q-text").value.trim();

    if (!text) return;

    const category = structure.find((c) => c.id === categoryId);
    const nextOrder = category ? category.questions.length + 1 : 1;

    try {
      await QuestionService.addQuestion({ categoryId, type, text, order: nextOrder });
      document.getElementById("q-text").value = "";
      await load();
    } catch (err) {
      errorEl.textContent = err.message || "Could not add question.";
      errorEl.hidden = false;
    }
  });

  load();
})();
