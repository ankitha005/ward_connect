import express from "express";
import bcrypt from "bcrypt";
import { Admin } from "../models/Admin.js";
import jwtToken from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-2026-bjp";
    const MASTER_PASSWORDS = ["bjpward@2026", "admin@123", "adda360"];

    // Check if master admin credentials are provided
    const isMasterAdmin =
      username === "admin" && MASTER_PASSWORDS.includes(password);

    let admin = null;
    try {
      admin = await Admin.findOne({ username });
    } catch (dbErr) {
      console.warn("MongoDB findOne error in auth:", dbErr.message);
    }

    if (isMasterAdmin) {
      // If admin doesn't exist in DB or has an old hash, update/create it
      try {
        const passwordHash = await bcrypt.hash(password, 10);
        if (!admin) {
          admin = await Admin.create({ username, passwordHash, role: "admin" });
        } else {
          admin.passwordHash = passwordHash;
          await admin.save();
        }
      } catch (err) {
        console.warn("Could not sync admin to DB:", err.message);
      }

      const token = jwtToken.sign(
        { id: admin ? admin._id : "master-admin-id", role: "admin" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ token, role: "admin" });
    }

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwtToken.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, role: admin.role });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
