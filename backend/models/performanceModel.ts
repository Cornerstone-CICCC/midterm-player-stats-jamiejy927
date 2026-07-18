import { pool } from "../db/pool.ts";

export const getPerformances = async (limit: number, offset: number, search: string, sortBy: string) => {
  const query = `
    SELECT 
      p.id AS performance_id,
      pl.player_name, 
      pl.team, 
      pl.position,
      p.opponent_team AS opponent,
      m.match_date,
      p.minutes_played,
      p.goals,
      p.assists,
      p.shots,
      p.pass_accuracy,
      p.player_rating
    FROM performances p
    JOIN players pl ON p.player_id = pl.player_id
    JOIN matches m ON p.match_id = m.match_id
    WHERE pl.player_name ILIKE $1
    ORDER BY p.id DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [`%${search}%`, limit, offset]);
  return result.rows; 
};