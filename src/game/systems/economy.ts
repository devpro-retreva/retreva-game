/**
 * Economy — pure functions, no UI.
 * Every balance change is a transaction with a unique id. A transaction id
 * can only ever be applied once, so a repeated click, a re-rendered dialog or
 * a reloaded save can never pay out twice. When cloud sync arrives, the same
 * ids let a server validate and de-duplicate rewards.
 */

export interface Transaction {
  id: string;
  /** Positive = credit, negative = debit. */
  amount: number;
  reason: string;
  at: number;
  destinationId?: string;
}

export interface Wallet {
  balance: number;
  ledger: Transaction[];
}

export type MoneyResult =
  | { ok: true; wallet: Wallet; tx: Transaction }
  | { ok: false; wallet: Wallet; error: 'duplicate' | 'insufficient' | 'invalid' };

export function createWallet(startingBalance: number): Wallet {
  return {
    balance: startingBalance,
    ledger: [{ id: 'start', amount: startingBalance, reason: 'Starting money', at: Date.now() }],
  };
}

export function hasTransaction(wallet: Wallet, id: string): boolean {
  return wallet.ledger.some((t) => t.id === id);
}

export function credit(wallet: Wallet, tx: Omit<Transaction, 'amount'> & { amount: number }): MoneyResult {
  if (!Number.isFinite(tx.amount) || tx.amount <= 0 || !tx.id) return { ok: false, wallet, error: 'invalid' };
  if (hasTransaction(wallet, tx.id)) return { ok: false, wallet, error: 'duplicate' };
  const entry: Transaction = { ...tx, amount: Math.round(tx.amount) };
  return { ok: true, tx: entry, wallet: { balance: wallet.balance + entry.amount, ledger: [...wallet.ledger, entry] } };
}

export function debit(wallet: Wallet, tx: Omit<Transaction, 'amount'> & { amount: number }): MoneyResult {
  if (!Number.isFinite(tx.amount) || tx.amount <= 0 || !tx.id) return { ok: false, wallet, error: 'invalid' };
  if (hasTransaction(wallet, tx.id)) return { ok: false, wallet, error: 'duplicate' };
  const amount = Math.round(tx.amount);
  if (wallet.balance < amount) return { ok: false, wallet, error: 'insufficient' };
  const entry: Transaction = { ...tx, amount: -amount };
  return { ok: true, tx: entry, wallet: { balance: wallet.balance - amount, ledger: [...wallet.ledger, entry] } };
}

/** Random-enough unique id without a dependency. */
export function makeId(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}
