import { PublicKey } from "@solana/web3.js";
import crypto from "crypto";
import nacl from "tweetnacl";
import bs58 from "bs58";

const PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export function deriveVaultPDA(signers: string[]): { address: string; bump: number } {
  const sortedSigners = [...signers].sort();
  const sha256Hash = crypto.createHash("sha256").update(sortedSigners.join(":")).digest();

  const [publicKey, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), sha256Hash],
    PROGRAM_ID
  );

  return {
    address: publicKey.toBase58(),
    bump: bump,
  };
}

export function verifySignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const messageBytes = Buffer.from(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

export function isValidSolanaPublicKey(pubkey: string): boolean {
  try {
    new PublicKey(pubkey);
    return true;
  } catch {
    return false;
  }
}
