const AnalyticsService = {
  async getSummary() {
    return NtcApi.apiRequest("/api/analytics/summary", { auth: true });
  },
};

window.AnalyticsService = AnalyticsService;
