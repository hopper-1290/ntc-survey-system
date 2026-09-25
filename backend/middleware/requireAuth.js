const { verify } = require("../utils/token");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verify(token);

  if (!payload) {
    return res.status(401).json({ error: "Unauthorized. Please log in again." });
  }

  req.user = payload;
  next();
}

module.exports = requireAuth;
