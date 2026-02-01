function adminRequired(req, res, next) {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({ error: "admin only" });
  }
  return next();
}

module.exports = { adminRequired };
