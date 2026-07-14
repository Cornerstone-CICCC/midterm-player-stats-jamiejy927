// backend/models/performanceModel.ts
import { pool } from "../db/pool.ts";

// Fetch all player data from the database
export const getAllPerformance = async () => {
  try {
    const query = "SELECT * FROM players";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};