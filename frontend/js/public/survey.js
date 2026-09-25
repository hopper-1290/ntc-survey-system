(function () {
  const loadingEl = document.getElementById("survey-loading");
  const errorEl = document.getElementById("survey-error");
  const formEl = document.getElementById("survey-form");
  const progressEl = document.getElementById("survey-progress");
  const stepLabelEl = document.getElementById("survey-step-label");
  const questionContainer = document.getElementById("survey-question-container");
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");

  let structure = []; // categories with nested questions (each category = one step)
  let currentStep = 0;
  const answers = {}; // questionId -> value

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function renderProgress() {
    progressEl.innerHTML = "";
    structure.forEach((_, i) => {
      const step = document.createElement("div");
      step.className =
        "survey-progress__step " +
        (i < currentStep ? "done" : i === currentStep ? "current" : "");
      progressEl.appendChild(step);
    });
    stepLabelEl.textContent = `Step ${currentStep + 1} of ${structure.length}`;
  }

  function renderStep() {
    const category = structure[currentStep];
    questionContainer.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = category.name;
    heading.style.marginBottom = "0.25rem";
    questionContainer.appendChild(heading);

    if (category.description) {
      const desc = document.createElement("p");
      desc.style.color = "var(--text-muted)";
      desc.style.fontSize = "0.9rem";
      desc.style.marginBottom = "1.25rem";
      desc.textContent = category.description;
      questionContainer.appendChild(desc);
    }

    category.questions.forEach((q) => {
      const wrap = document.createElement("div");
      wrap.className = "survey-question";

      const label = document.createElement("h3");
      label.textContent = q.text;
      wrap.appendChild(label);

      if (q.type === "rating") {
        wrap.appendChild(buildRatingInput(q));
      } else {
        wrap.appendChild(buildTextInput(q));
      }

      questionContainer.appendChild(wrap);
    });

    btnBack.hidden = currentStep === 0;
    btnNext.textContent = currentStep === structure.length - 1 ? "Submit" : "Next \u2192";
    renderProgress();
  }

  function buildRatingInput(question) {
    const scale = document.createElement("div");
    scale.className = "rating-scale";
    const labels = ["1", "2", "3", "4", "5"];

    labels.forEach((val) => {
      const option = document.createElement("div");
      option.className = "rating-scale__option";
      option.style.position = "relative";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q_${question.id}`;
      input.id = `q_${question.id}_${val}`;
      input.value = val;
      input.required = true;
      if (answers[question.id] === Number(val)) input.checked = true;
      input.addEventListener("change", () => {
        answers[question.id] = Number(val);
      });

      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = val;

      option.appendChild(input);
      option.appendChild(label);
      scale.appendChild(option);
    });

    return scale;
  }

  function buildTextInput(question) {
    const field = document.createElement("div");
    field.className = "field";
    const textarea = document.createElement("textarea");
    textarea.rows = 3;
    textarea.placeholder = "Type your answer (optional)...";
    textarea.value = answers[question.id] || "";
    textarea.addEventListener("input", () => {
      answers[question.id] = textarea.value;
    });
    field.appendChild(textarea);
    return field;
  }

  function currentStepIsComplete() {
    const category = structure[currentStep];
    return category.questions.every((q) => {
      if (q.type !== "rating") return true; // text answers are optional
      return typeof answers[q.id] === "number";
    });
  }

  async function handleSubmitStep(e) {
    e.preventDefault();
    errorEl.hidden = true;

    if (!currentStepIsComplete()) {
      showError("Please answer all rating questions before continuing.");
      return;
    }

    if (currentStep < structure.length - 1) {
      currentStep += 1;
      renderStep();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Final step — submit to the backend
    btnNext.disabled = true;
    btnNext.textContent = "Submitting...";

    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({
        questionId: Number(questionId),
        value,
      }));
      await ResponseService.submit(payload);
      window.location.href = "thank-you.html";
    } catch (err) {
      showError(err.message || "Something went wrong submitting your response.");
      btnNext.disabled = false;
      btnNext.textContent = "Submit";
    }
  }

  function handleBack() {
    if (currentStep === 0) return;
    currentStep -= 1;
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function init() {
    try {
      structure = await QuestionService.getSurveyStructure();
      if (structure.length === 0) {
        loadingEl.textContent = "The survey is not available right now. Please check back later.";
        return;
      }
      loadingEl.hidden = true;
      formEl.hidden = false;
      renderStep();
    } catch (err) {
      loadingEl.hidden = true;
      showError(
        "Could not load the survey. Please make sure the API server is running, then refresh."
      );
    }
  }

  btnBack.addEventListener("click", handleBack);
  formEl.addEventListener("submit", handleSubmitStep);

  init();
})();
