(function () {
  AuthService.guard();

  const user = AuthService.currentUser();
  const userLabel = document.getElementById("admin-user-label");
  if (userLabel && user) {
    userLabel.textContent = user.name || user.username;
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      AuthService.logout();
    });
  }
})();
