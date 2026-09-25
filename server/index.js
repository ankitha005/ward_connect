import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import aiRoutes from "./routes/ai.js";
import announcementRoutes from "./routes/announcements.js";
import surveyRoutes from "./routes/surveys.js";
import volunteerRoutes from "./routes/volunteers.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/chat", aiRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/volunteers", volunteerRoutes);

// MongoDB connection
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB (Mongoose caches this connection globally)
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Expose server port in non-serverless environments
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

export default app;
