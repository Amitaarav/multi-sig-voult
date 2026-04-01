import { Router } from "express";
import * as proposalController from "../controllers/proposalController.js";

const router = Router();

// Base path is /api/vault/:vaultId
router.post("/propose", proposalController.createProposal);
router.get("/proposals", proposalController.listProposals);
router.get("/proposals/:proposalId", proposalController.getProposal);
router.post("/proposals/:proposalId/approve", proposalController.approveProposal);
router.post("/proposals/:proposalId/cancel", proposalController.cancelProposal);

export default router;
