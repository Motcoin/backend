interface TxIn {
  txOutId: string;
  txOutIndex: number;
  signature: string;
}

interface TxOut {
  address: string;
  amount: number;
}

interface Transaction {
  txIns: TxIn[]
  txOuts: TxOut[]
  id: string
}

export const unconfirmedTransactions: Transaction[] = []


