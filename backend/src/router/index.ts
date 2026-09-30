import { Router } from "express";
import etablissementRouter from "./etablissements";

const router = Router();

router.use(etablissementRouter);

router.get("/", (req, res) => {
  res.status(200).json({ sa: "Bonjour" });
});

export default router;
