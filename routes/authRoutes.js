// routes/authRoutes.js
const express = require("express");
const { buildAuthController } = require("../controllers/authController");

function createAuthRoutes(usersCollection) {
  const router = express.Router();
  const auth = buildAuthController(usersCollection);

  router.post("/login", auth.login);
  router.post("/logout", auth.logout);
  router.get("/me", auth.me);

  return router;
}

module.exports = { createAuthRoutes };
