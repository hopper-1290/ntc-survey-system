const AuthService = {
  async login(username, password) {
    const data = await NtcApi.apiRequest("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });
    NtcApi.setSession(data.token, data.user);
    return data.user;
  },

  logout() {
    NtcApi.clearSession();
    window.location.href = "login.html";
  },

  isLoggedIn() {
    return Boolean(NtcApi.getToken());
  },

  currentUser() {
    return NtcApi.getCurrentUser();
  },

  /** Call at the top of every protected admin page. */
  guard() {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
    }
  },
};

window.AuthService = AuthService;
