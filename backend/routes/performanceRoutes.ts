import express from "express";
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

export default router;