const {getUser}=require("../services/auth")


module.exports = function authMiddleware(req, res, next) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = getUser(sessionId);
  if (!user) {
    return res.status(401).json({ error: "Session expired" });
  }

  req.user = user;
  next();
};

