import { Vault, Proposal } from "./types.js";

class Storage {
  private vaults: Map<number, Vault> = new Map();
  private proposals: Map<number, Proposal> = new Map();
  private vaultIdCounter = 1;
  private proposalIdCounter = 1;

  public createVault(vault: Omit<Vault, "id" | "proposalCount" | "data">): Vault {
    const id = this.vaultIdCounter++;
    const newVault: Vault = {
      ...vault,
      id,
      proposalCount: 0,
      data: {},
    };
    this.vaults.set(id, newVault);
    return newVault;
  }

  public getVault(id: number): Vault | undefined {
    return this.vaults.get(id);
  }

  public getVaultByPDA(address: string): Vault | undefined {
    return Array.from(this.vaults.values()).find(v => v.address === address);
  }

  public createProposal(proposal: Omit<Proposal, "id" | "status" | "signatures" | "createdAt">): Proposal {
    const id = this.proposalIdCounter++;
    const newProposal: Proposal = {
      ...proposal,
      id,
      status: "pending",
      signatures: [],
      createdAt: new Date().toISOString(),
    };
    this.proposals.set(id, newProposal);
    const vault = this.vaults.get(proposal.vaultId);
    if (vault) {
      vault.proposalCount++;
    }
    return newProposal;
  }

  public getProposal(id: number): Proposal | undefined {
    return this.proposals.get(id);
  }

  public getVaultProposals(vaultId: number): Proposal[] {
    return Array.from(this.proposals.values()).filter(p => p.vaultId === vaultId);
  }

  public updateProposal(proposal: Proposal): void {
    this.proposals.set(proposal.id, proposal);
  }

  public updateVaultData(vaultId: number, key: string, value: string): void {
    const vault = this.vaults.get(vaultId);
    if (vault) {
      vault.data[key] = value;
    }
  }
}

export const storage = new Storage();
