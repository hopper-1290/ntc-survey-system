(function () {
  const user = AuthService.currentUser();
  if (user) {
    document.getElementById("settings-name").textContent = user.name || "\u2014";
    document.getElementById("settings-username").textContent = user.username || "\u2014";
    document.getElementById("settings-role").textContent = user.role || "\u2014";
  }
})();
