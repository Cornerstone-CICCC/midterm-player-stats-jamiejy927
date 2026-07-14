import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import performanceRoutes from "./routes/performanceRoutes.ts"; 

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Middleware setup
app.use(cors({ origin: "http://localhost:4321" })); // Allow requests from Astro frontend
app.use(express.json()); // Parse incoming JSON requests
app.use(express.static(path.join(__dirname, "public")));

// Define API routes
app.use("/api/performance", performanceRoutes);

const PORT = 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});