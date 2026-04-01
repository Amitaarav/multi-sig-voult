import { Request, Response } from "express";
import { storage } from "../storage.js";
import { verifySignature, isValidSolanaPublicKey } from "../utils/solana.js";
import { ProposalAction, ActionParams } from "../types.js";

export const createProposal = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const { proposer, action, params } = req.body;

  const vault = storage.getVault(vaultId);
  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  if (!vault.signers.includes(proposer)) {
    return res.status(403).json({ error: "Not a vault signer" });
  }

  if (!["transfer", "set_data", "memo"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  if (action === "transfer") {
    const { to, amount } = params as { to: string; amount: number };
    if (!to || !isValidSolanaPublicKey(to) || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer params" });
    }
  } else if (action === "set_data") {
    const { key, value } = params as { key: string; value: string };
    if (!key || typeof key !== "string" || !value || typeof value !== "string") {
      return res.status(400).json({ error: "Invalid set_data params" });
    }
  } else if (action === "memo") {
    const { content } = params as { content: string };
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Invalid memo params" });
    }
  }

  const proposal = storage.createProposal({
    vaultId,
    proposer,
    action: action as ProposalAction,
    params: params as ActionParams,
  });

  res.status(201).json(proposal);
};

export const approveProposal = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const proposalId = parseInt(req.params.proposalId as string);
  const { signer, signature } = req.body;

  const vault = storage.getVault(vaultId);
  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  const proposal = storage.getProposal(proposalId);
  if (!proposal || proposal.vaultId !== vaultId) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  if (proposal.status !== "pending") {
    return res.status(409).json({ error: `Proposal already ${proposal.status}` });
  }

  if (!vault.signers.includes(signer)) {
    return res.status(403).json({ error: "Not a vault signer" });
  }

  if (proposal.signatures.some((s: any) => s.signer === signer)) {
    return res.status(409).json({ error: "Already signed" });
  }

  const msg = `approve:${proposalId}`;
  if (!verifySignature(msg, signature, signer)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  proposal.signatures.push({ signer, createdAt: new Date().toISOString() });

  if (proposal.signatures.length >= vault.threshold) {
    proposal.status = "executed";
    proposal.executedAt = new Date().toISOString();

    if (proposal.action === "set_data") {
      const { key, value } = proposal.params as { key: string; value: string };
      storage.updateVaultData(vaultId, key, value);
    }
  }

  storage.updateProposal(proposal);
  res.status(200).json(proposal);
};

export const cancelProposal = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const proposalId = parseInt(req.params.proposalId as string);
  const { signer, signature } = req.body;

  const vault = storage.getVault(vaultId);
  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  const proposal = storage.getProposal(proposalId);
  if (!proposal || proposal.vaultId !== vaultId) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  if (signer !== proposal.proposer) {
    return res.status(403).json({ error: "Only the proposer can cancel" });
  }

  if (proposal.status === "executed") {
    return res.status(409).json({ error: "Proposal already executed" });
  }

  if (proposal.status === "cancelled") {
    return res.status(409).json({ error: "Proposal already cancelled" });
  }

  const msg = `cancel:${proposalId}`;
  if (!verifySignature(msg, signature, signer)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  proposal.status = "cancelled";
  storage.updateProposal(proposal);
  res.status(200).json(proposal);
};

export const listProposals = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const { status } = req.query;

  const vault = storage.getVault(vaultId);
  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  let proposals = storage.getVaultProposals(vaultId);
  if (status && typeof status === "string") {
    proposals = proposals.filter((p: any) => p.status === status);
  }

  res.status(200).json(proposals);
};

export const getProposal = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const proposalId = parseInt(req.params.proposalId as string);

  const proposal = storage.getProposal(proposalId);
  if (!proposal || proposal.vaultId !== vaultId) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  res.status(200).json(proposal);
};
