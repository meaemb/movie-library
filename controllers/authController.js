// controllers/authController.js
const bcrypt = require("bcrypt");

function buildAuthController(usersCollection) {
  return {
    login: async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = await usersCollection.findOne({
          email: String(email).toLowerCase(),
        });

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // ⚠️ важно: кладём role в сессию
        req.session.user = {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "user",
        };

        res.json({ message: "Logged in" });
      } catch (err) {
        res.status(500).json({ error: "Server error" });
      }
    },

    logout: (req, res) => {
      req.session.destroy(() => {
        res.clearCookie("sid");
        res.json({ message: "Logged out" });
      });
    },

    me: (req, res) => {
      res.json({ user: req.session.user || null });
    },
  };
}

module.exports = { buildAuthController };
