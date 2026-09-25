import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }, // We will store hashed passwords using bcrypt
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

export const Admin = mongoose.model("Admin", adminSchema);
