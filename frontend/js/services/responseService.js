const ResponseService = {
  /** Public: guest submits their completed survey. */
  async submit(answers) {
    return NtcApi.apiRequest("/api/responses", {
      method: "POST",
      body: { answers },
    });
  },

  /** Admin: paginated list of submissions, newest first. */
  async list({ page = 1, pageSize = 10 } = {}) {
    return NtcApi.apiRequest(`/api/responses?page=${page}&pageSize=${pageSize}`, {
      auth: true,
    });
  },

  async getById(id) {
    return NtcApi.apiRequest(`/api/responses/${id}`, { auth: true });
  },

  async remove(id) {
    return NtcApi.apiRequest(`/api/responses/${id}`, { method: "DELETE", auth: true });
  },
};

window.ResponseService = ResponseService;
