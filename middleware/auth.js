// middleware/auth.js

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}


function requireOwnerOrAdmin(getOwnerId) {
  return async (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // admin bypass
    if (req.session.user.role === "admin") {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req); 
      if (!ownerId) {
        return res.status(404).json({ error: "Resource not found" });
      }

      if (String(ownerId) !== String(req.session.user.id)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (e) {
      return res.status(500).json({ error: "Server error" });
    }
  };
}

module.exports = { requireAuth, requireRole, requireOwnerOrAdmin };
