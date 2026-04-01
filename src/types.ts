export interface Signature {
  signer: string;
  createdAt: string;
}

export type ActionParams = 
  | { to: string; amount: number } // transfer
  | { key: string; value: string } // set_data
  | { content: string };           // memo

export type ProposalAction = "transfer" | "set_data" | "memo";

export type ProposalStatus = "pending" | "executed" | "cancelled";

export interface Proposal {
  id: number;
  vaultId: number;
  proposer: string;
  action: ProposalAction;
  params: ActionParams;
  status: ProposalStatus;
  signatures: Signature[];
  createdAt: string;
  executedAt?: string;
}

export interface Vault {
  id: number;
  label: string;
  address: string;
  threshold: number;
  bump: number;
  signers: string[];
  data: Record<string, string>;
  createdAt: string;
  proposalCount: number;
}
