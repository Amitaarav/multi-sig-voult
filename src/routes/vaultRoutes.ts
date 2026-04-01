import { Router } from "express";
import * as vaultController from "../controllers/vaultController.js";

const router = Router();

router.post("/create", vaultController.createVault);
router.get("/:vaultId", vaultController.getVault);
router.get("/:vaultId/data", vaultController.getVaultData);

export default router;
