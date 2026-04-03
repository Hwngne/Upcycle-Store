// routes/spinConfigRoutes.js
import express from "express";
import { getSpinConfig } from "../../controllers/web//spinConfigController.js";

const router = express.Router();
router.get("/", getSpinConfig);

export default router;
