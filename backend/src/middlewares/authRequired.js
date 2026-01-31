const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.id; // compat avec votre login actuel
    req.auth = { userId, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

module.exports = { authRequired };
