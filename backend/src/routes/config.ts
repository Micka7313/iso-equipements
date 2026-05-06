import { Router, Request, Response } from "express";
import { getHistory, clearHistory } from "../db/history";
import { getFavorites, addFavorite, removeFavorite } from "../db/favorites";

const router = Router();

router.get("/history", (_req: Request, res: Response) => {
  res.json(getHistory());
});

router.delete("/history", (_req: Request, res: Response) => {
  clearHistory();
  res.json({ ok: true });
});

router.get("/favorites", (_req: Request, res: Response) => {
  res.json(getFavorites());
});

router.post("/favorites", (req: Request, res: Response) => {
  const { oemRef, label } = req.body as { oemRef: string; label?: string };
  if (!oemRef) {
    res.status(400).json({ error: "oemRef requis" });
    return;
  }
  addFavorite(oemRef, label);
  res.json({ ok: true });
});

router.delete("/favorites/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID invalide" });
    return;
  }
  removeFavorite(id);
  res.json({ ok: true });
});

router.get("/status", (_req: Request, res: Response) => {
  res.json({
    dasirConfigured: !!(process.env.DASIR_USERNAME && process.env.DASIR_PASSWORD),
    erpConfigured: !!(process.env.ERP_API_URL && process.env.ERP_API_KEY),
    nodeEnv: process.env.NODE_ENV ?? "development",
  });
});

export default router;
