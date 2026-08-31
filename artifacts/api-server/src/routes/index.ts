import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pawAndBookRouter from "./paw-and-book";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pawAndBookRouter);

export default router;
