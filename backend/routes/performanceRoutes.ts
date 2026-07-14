import express from "express";
import { getAllPerformance } from "../models/performanceModel.ts";

const router = express.Router();

// API endpoint to get player data
router.get("/", async (req, res) => {
  try {
    const players = await getAllPerformance();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player data" });
  }
});

export default router;