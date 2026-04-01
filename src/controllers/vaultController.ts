import { Request, Response } from "express";
import { storage } from "../storage.js";
import { deriveVaultPDA, isValidSolanaPublicKey } from "../utils/solana.js";

export const createVault = (req: Request, res: Response) => {
  const { signers, threshold, label } = req.body;

  if (!signers || !Array.isArray(signers) || signers.length < 2) {
    return res.status(400).json({ error: "Invalid signers: must be an array with at least 2 public keys" });
  }

  if (typeof threshold !== "number" || threshold < 1 || threshold > signers.length) {
    return res.status(400).json({ error: "Invalid threshold: must be between 1 and signers.length" });
  }

  if (!label || typeof label !== "string") {
    return res.status(400).json({ error: "Invalid label: must be a non-empty string" });
  }

  const uniqueSigners = new Set<string>();
  for (const signer of signers) {
    if (!isValidSolanaPublicKey(signer)) {
      return res.status(400).json({ error: `Invalid Solana public key: ${signer}` });
    }
    if (uniqueSigners.has(signer)) {
      return res.status(400).json({ error: `Duplicate signer: ${signer}` });
    }
    uniqueSigners.add(signer);
  }

  const { address, bump } = deriveVaultPDA(signers);

  if (storage.getVaultByPDA(address)) {
    return res.status(409).json({ error: "Vault with same signer set already exists" });
  }

  const newVault = storage.createVault({
    label,
    address,
    threshold,
    bump,
    signers,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(newVault);
};

export const getVault = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const vault = storage.getVault(vaultId);

  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  res.status(200).json(vault);
};

export const getVaultData = (req: Request, res: Response) => {
  const vaultId = parseInt(req.params.vaultId as string);
  const vault = storage.getVault(vaultId);

  if (!vault) {
    return res.status(404).json({ error: "Vault not found" });
  }

  res.status(200).json({ data: vault.data });
};
