import express from "express";
import { pool } from "../db/pool.ts";
import { getPerformances } from "../models/performanceModel.ts";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("--- request! ---");
  console.log("REQ QUERY:", req.query); 
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || '';

  const players = await getPerformances(limit, offset, search);
  res.json(players);
});

router.get("/player/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query("SELECT * FROM players WHERE player_id = $1", [id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update
router.put("/player/:id", async (req, res) => {
  const { id } = req.params;
  const { player_name, team, position } = req.body;
  await pool.query(
    "UPDATE players SET player_name = $1, team = $2, position = $3 WHERE player_id = $4",
    [player_name, team, position, id]
  );
  res.json({ message: "Updated successfully" });
});

router.get("/rankings", async (req, res) => {
  const sortBy = req.query.sortBy as string || 'total_goals_tournament';
  try {
    const result = await pool.query(
      `SELECT * FROM players ORDER BY ${sortBy} DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;