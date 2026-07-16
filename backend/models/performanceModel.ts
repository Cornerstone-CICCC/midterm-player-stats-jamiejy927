import { pool } from "../db/pool.ts";

export const getPerformances = async (limit: number, offset: number, search: string) => {
  const query = `
    SELECT p.*, pl.player_name, pl.team, pl.position, 
           pl.total_goals_tournament, pl.total_assists_tournament, pl.tournament_rating
    FROM performances p
    JOIN players pl ON p.player_id = pl.player_id
    WHERE pl.player_name ILIKE $1
    ORDER BY p.id ASC
    LIMIT $2 OFFSET $3
  `;
  
  const values = [`%${search}%`, limit, offset];
  const result = await pool.query(query, values);
  return result.rows; 
};