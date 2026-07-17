import { pool } from "../db/pool.ts";

export const getPerformances = async (limit: number, offset: number, search: string) => {
const query = `
  SELECT 
    pl.player_id,
    pl.player_name, 
    pl.team, 
    pl.position, 
    SUM(p.goals) as total_goals_tournament, 
    SUM(p.assists) as total_assists_tournament, 
    ROUND(AVG(p.player_rating)::numeric, 1) as tournament_rating
  FROM players pl
  JOIN performances p ON pl.player_id = p.player_id
  WHERE pl.player_name ILIKE $1
  GROUP BY pl.player_id, pl.player_name, pl.team, pl.position
  ORDER BY pl.player_id ASC
  LIMIT $2 OFFSET $3
`;
  
  const values = [`%${search}%`, limit, offset];
  const result = await pool.query(query, values);
  return result.rows; 
};