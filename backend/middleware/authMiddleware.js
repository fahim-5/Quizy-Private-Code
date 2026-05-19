// Simple auth middleware placeholder
module.exports.protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // In a real app you'd verify the token and load user
  req.user = { id: "dummy-user-id" };
  next();
};
