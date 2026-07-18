import { pool } from "../db/pool.ts";

export const getPerformances = async (limit: number, offset: number, search: string, sortBy: string) => {
  const sortMap: { [key: string]: string } = {
    'player_name': 'pl.player_name ASC',
    'team': 'pl.team ASC',
    'position': 'pl.position ASC',
    'total_goals_tournament': 'total_goals_tournament DESC',
    'total_assists_tournament': 'total_assists_tournament DESC',
    'tournament_rating': 'tournament_rating DESC'
  };

  const orderBy = sortMap[sortBy] || 'pl.player_id ASC';

  const query = `
    SELECT 
      pl.player_id, pl.player_name, pl.team, pl.position, 
      SUM(p.goals) as total_goals_tournament, 
      SUM(p.assists) as total_assists_tournament, 
      ROUND(AVG(p.player_rating)::numeric, 1) as tournament_rating
    FROM players pl
    JOIN performances p ON pl.player_id = p.player_id
    WHERE pl.player_name ILIKE $1
    GROUP BY pl.player_id, pl.player_name, pl.team, pl.position
    ORDER BY ${orderBy}
    LIMIT $2 OFFSET $3
  `;
  
  const values = [`%${search}%`, limit, offset];
  const result = await pool.query(query, values);
  return result.rows; 
};