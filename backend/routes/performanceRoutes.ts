import express from "express";
import { pool } from "../db/pool.ts";
import { getPerformances } from "../models/performanceModel.ts";

const router = express.Router();

router.get("/performance-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // p.opponent_team으로 수정했습니다
    const query = `
      SELECT p.*, pl.player_name, pl.position, pl.jersey_number, pl.nationality, pl.team,
             m.match_date
      FROM performances p
      JOIN players pl ON p.player_id = pl.player_id
      JOIN matches m ON p.match_id = m.match_id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Performance not found" });
    }
  } catch (err) {
    console.error("Detail API error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.put("/performance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { goals, assists, shots, minutes_played, player_rating } = req.body;
    
    await pool.query(
      `UPDATE performances 
       SET goals = $1, assists = $2, shots = $3, minutes_played = $4, player_rating = $5 
       WHERE id = $6`,
      [goals, assists, shots, minutes_played, player_rating, id]
    );
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Update API error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/count", async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    const query = "SELECT COUNT(*) FROM players WHERE player_name ILIKE $1";
    const result = await pool.query(query, [`%${search}%`]);
    
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
    console.error("List API error:", err);
    res.status(500).json({ error: "Server Error" });
  }
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
    console.error("Rankings API error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;