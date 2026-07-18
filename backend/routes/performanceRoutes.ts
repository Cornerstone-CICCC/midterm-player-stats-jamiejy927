import express from "express";
import { pool } from "../db/pool.ts";
import { getPerformances } from "../models/performanceModel.ts";

const router = express.Router();

router.get("/count", async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    const query = "SELECT COUNT(*) FROM players WHERE player_name ILIKE $1";
    const result = await pool.query(query, [`%${search}%`]);
    
    console.log("DB count result:", result.rows[0]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Count API error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const sortBy = (req.query.sortBy as string) || 'player_name';

    const players = await getPerformances(limit, offset, search, sortBy);
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
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
  
  const query = `
    SELECT 
      pl.player_name, 
      pl.team, 
      SUM(p.goals) as total_goals_tournament, 
      SUM(p.assists) as total_assists_tournament, 
      ROUND(AVG(p.player_rating)::numeric, 1) as tournament_rating
    FROM players pl
    JOIN performances p ON pl.player_id = p.player_id
    GROUP BY pl.player_id, pl.player_name, pl.team
    ORDER BY ${sortBy === 'total_assists_tournament' ? 'total_assists_tournament' : 
               sortBy === 'tournament_rating' ? 'tournament_rating' : 'total_goals_tournament'} DESC
    LIMIT 10
  `;

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;