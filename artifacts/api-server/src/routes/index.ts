import { Router, type IRouter } from "express";
import pawAndBookRouter from "./paw-and-book";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

router.use(pawAndBookRouter);

export default router;
