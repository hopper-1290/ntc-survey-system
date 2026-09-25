const QuestionService = {
  async getCategories() {
    return NtcApi.apiRequest("/api/categories");
  },

  async getQuestions() {
    return NtcApi.apiRequest("/api/questions");
  },

  /** Groups the flat question list by category, sorted, ready for rendering. */
  async getSurveyStructure() {
    const [categories, questions] = await Promise.all([
      this.getCategories(),
      this.getQuestions(),
    ]);

    return categories
      .sort((a, b) => a.id - b.id)
      .map((category) => ({
        ...category,
        questions: questions
          .filter((q) => q.categoryId === category.id)
          .sort((a, b) => a.order - b.order),
      }));
  },

  /** Admin only: add a new survey question. */
  async addQuestion({ categoryId, type, text, order }) {
    return NtcApi.apiRequest("/api/questions", {
      method: "POST",
      auth: true,
      body: { categoryId, type, text, order },
    });
  },

  /** Admin only: remove a survey question. */
  async removeQuestion(id) {
    return NtcApi.apiRequest(`/api/questions/${id}`, { method: "DELETE", auth: true });
  },
};

window.QuestionService = QuestionService;
