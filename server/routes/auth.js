import express from "express";
import bcrypt from "bcrypt";
import { Admin } from "../models/Admin.js";
import jwtToken from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcode fallback check for the initial migration, or just check db
    const admin = await Admin.findOne({ username });
    if (!admin) {
      // In a real app we'd just return 401. But let's create a default admin if none exists for demo purposes
      if (
        username === "admin" &&
        (password === "admin@123" ||
          password === "adda360" ||
          password === "bjpward@2026")
      ) {
        const passwordHash = await bcrypt.hash(password, 10);
        await Admin.create({ username, passwordHash });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const validAdmin = await Admin.findOne({ username });
    const isMatch = await bcrypt.compare(password, validAdmin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwtToken.sign(
      { id: validAdmin._id, role: validAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
