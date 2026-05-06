import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import searchRouter from "./routes/search";
import configRouter from "./routes/config";
import { getDb } from "./db/schema";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use("/api/search", searchRouter);
app.use("/api", configRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Initialiser la BDD au démarrage
getDb();

app.listen(PORT, () => {
  console.log(`\n🚀 Backend Dashboard Magasinier`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Dasir configuré : ${!!(process.env.DASIR_USERNAME)}`);
  console.log(`   → ERP configuré   : ${!!(process.env.ERP_API_URL)}\n`);
});
