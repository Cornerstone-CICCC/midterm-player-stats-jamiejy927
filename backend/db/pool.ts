import pg from "pg";
import dotenv from "dotenv";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const { Pool } = pg;

export const pool = new Pool({
    user: 'jamie',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'worldcup',
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});