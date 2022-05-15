/* eslint-disable unicorn/no-array-reduce */
/* eslint-disable unicorn/no-array-callback-reference */
import { ec as EC } from "elliptic";
import { andReducer } from "../utils/reducer";
import CryptoJS from "crypto-js";
import { COINBASE_AMOUNT } from "../blockchain-paremeters";
const ec = new EC("ed25519");

interface TxIn {
  txOutId: string;
  txOutIndex: number;
  signature: string;
}

interface TxOut {
  address: string;
  amount: number;
}

export interface Transaction {
  txIns: TxIn[];
  txOuts: TxOut[];
  id: string;
}

interface UnspentTxOut {
  txOutId: string;
  txOutIndex: number;
  address: string;
  amount: number;
}

export let unspentTransactionOut: UnspentTxOut[] = [];

type TransactionWithoutId = Omit<Transaction, "id">;

const getTransactionId = (transaction: TransactionWithoutId): string => {
  const txInContent: string = transaction.txIns
    .map((txIn) => `${txIn.txOutId}${txIn.txOutIndex}`)
    .join("");
  const txOutContent: string = transaction.txOuts
    .map((txOut) => `${txOut.address}${txOut.amount}`)
    .join("");

  return CryptoJS.SHA256(`${txInContent}${txOutContent}`).toString();
};

const isValidTxInStructure = (txIn: TxIn) => {
  if (typeof txIn.txOutId !== "string") {
    return false;
  }
  if (typeof txIn.txOutIndex !== "number") {
    return false;
  }
  if (typeof txIn.signature !== "string") {
    return false;
  }
  return true;
};

//valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address: string): boolean => {
  if (address.length !== 130) {
    console.log("invalid public key length");
    return false;
  } else if (address.match("^[a-fA-F0-9]+$") === null) {
    console.log("public key must contain only hex characters");
    return false;
  } else if (!address.startsWith("04")) {
    console.log("public key must start with 04");
    return false;
  }
  return true;
};

const isValidTxOutStructure = (txOut: TxOut) => {
  if (typeof txOut.address !== "string") {
    return false;
  }
  if (!isValidAddress(txOut.address)) {
    return false;
  }
  if (typeof txOut.amount !== "number") {
    return false;
  }
  return true;
};

export const isValidTransactionStructure = (transaction: Transaction) => {
  if (typeof transaction.id !== "string") {
    return false;
  }
  if (!Array.isArray(transaction.txOuts)) {
    return false;
  }
  if (!Array.isArray(transaction.txIns)) {
    return false;
  }
  if (transaction.txIns.length > 0) {
    for (const txIn of transaction.txIns) {
      const result = isValidTxInStructure(txIn);
      if (!result) {
        return false;
      }
    }
  }
  if (transaction.txOuts.length > 0) {
    for (const txOut of transaction.txOuts) {
      const result = isValidTxOutStructure(txOut);
      if (!result) {
        return false;
      }
    }
  }
  return true;
};

const isValidTransactionsStructure = (transactions: Transaction[]) => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return transactions
    .map((t) => isValidTransactionStructure(t))
    .reduce((a, b) => a && b, true);
};

const validateTxIn = (
  txIn: TxIn,
  transaction: Transaction,
  unspentTxOuts: UnspentTxOut[]
): boolean => {
  const referencedUTxOut: UnspentTxOut | undefined = unspentTxOuts.find(
    (uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutId === txIn.txOutId
  );
  if (!referencedUTxOut) {
    console.log("referenced txOut not found: " + JSON.stringify(txIn));
    return false;
  }
  const address = referencedUTxOut.address;

  const key = ec.keyFromPublic(address, "hex");
  return key.verify(transaction.id, txIn.signature);
};

const validateTxIns = (
  txIns: TxIn[],
  transaction: Transaction,
  unspentTxOuts: UnspentTxOut[]
): boolean => {
  return txIns
    .map((txIn) => validateTxIn(txIn, transaction, unspentTxOuts))
    .reduce((a, b) => a && b, true);
};

const validateTxOut = (
  transaction: Transaction,
  aUnspentTxOuts: UnspentTxOut[]
) => {
  const totalTxInValue = transaction.txIns
    .map((txIn) => getTxInAmount(txIn, aUnspentTxOuts))
    .reduce((a, b) => a + b);
  const totalTxOutValue = transaction.txOuts
    .map((txOut) => txOut.amount)
    .reduce((a, b) => a + b);

  if (totalTxInValue !== totalTxOutValue) {
    console.log(
      "totalTxOutValues !== totalTxInValues in tx: " + transaction.id
    );
    return false;
  }
};

const validateCoinbaseTx = (
  transaction: Transaction,
  blockIndex: number
): boolean => {
  if (getTransactionId(transaction) !== transaction.id) {
    console.log("invalid coinbase tx id: " + transaction.id);
    return false;
  }
  if (transaction.txIns.length !== 1) {
    console.log("one txIn must be specified in the coinbase transaction");
    return false;
  }
  if (transaction.txIns[0].txOutIndex !== blockIndex) {
    console.log("the txIn index in coinbase tx must be the block height");
    return false;
  }
  if (transaction.txOuts.length !== 1) {
    console.log("invalid number of txOuts in coinbase transaction");
    return false;
  }
  if (transaction.txOuts[0].amount != COINBASE_AMOUNT) {
    console.log("invalid coinbase amount in coinbase transaction");
    return false;
  }
  return true;
};

const validateTransaction = (
  transaction: Transaction,
  unspentTxOuts: UnspentTxOut[]
): boolean => {
  if (getTransactionId(transaction) !== transaction.id) {
    console.log("invalid tx id:", transaction.id);
    return false;
  }

  if (!validateTxIns(transaction.txIns, transaction, unspentTxOuts)) {
    console.log("some of the txIns are invalid in tx: " + transaction.id);
    return false;
  }

  if (!validateTxOut(transaction, unspentTransactionOut)) {
    console.log("some of the txIns are invalid in tx: " + transaction.id);
    return false;
  }

  return true;
};

const validateBlockTransactions = (
  transactions: Transaction[],
  unspentTxOuts: UnspentTxOut[],
  blockIndex: number
) => {
  const [cointbase_tx, ...otherTransactions] = transactions;
  if (!validateCoinbaseTx(cointbase_tx, blockIndex)) {
    console.log("invalid coinbase tx");
    return false;
  }

  //check for duplicates

  const txIns: TxIn[] = transactions.flatMap((tx) => tx.txIns);

  if (hasDuplicates(txIns)) {
    return false;
  }

  const isValidTransaction = otherTransactions
    .map((tx) => validateTransaction(tx, unspentTransactionOut))
    .reduce(andReducer, true);

  if (!isValidTransaction) {
    return false;
  }

  return true;
};

const hasDuplicates = (txIns: TxIn[]): boolean => {
  const ids: string[] = [];
  for (const txIn of txIns) {
    if (ids.includes(txIn.txOutId)) {
      console.log("duplicate txIn:", txIn.txOutId);
      return true;
    } else {
      ids.push(txIn.txOutId);
    }
  }
  return false;
};

const getTxInAmount = (txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number => {
  const txOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
  if (!txOut) {
    console.log("tx out not found");
    return -1;
  }
  return txOut.amount;
};

const findUnspentTxOut = (
  transactionId: string,
  index: number,
  aUnspentTxOuts: UnspentTxOut[]
): UnspentTxOut | undefined => {
  return aUnspentTxOuts.find(
    (uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index
  );
};

export const getCoinbaseTransaction = (
  address: string,
  blockIndex: number
): Transaction => {
  const txIn: TxIn = {
    signature: "",
    txOutId: "",
    txOutIndex: blockIndex,
  };

  const transactionWithoutId: TransactionWithoutId = {
    txIns: [txIn],
    txOuts: [{ address, amount: COINBASE_AMOUNT }],
  };

  const transaction: Transaction = {
    ...transactionWithoutId,
    id: getTransactionId(transactionWithoutId),
  };
  return transaction;
};

const updateUnspentTxOuts = (newTransactions: Transaction[]) => {
  const newUnspentTxOuts: UnspentTxOut[] = newTransactions.flatMap((t) => {
    return t.txOuts.map(
      (txOut, index): UnspentTxOut => ({
        txOutId: t.id,
        txOutIndex: index,
        ...txOut,
      })
    );
  });

  const consumedTxOuts: UnspentTxOut[] = newTransactions
    .flatMap((t) => t.txIns)
    .map((txIn) => ({
      txOutId: txIn.txOutId,
      txOutIndex: txIn.txOutIndex,
      address: "",
      amount: 0,
    }));

  const resultingUnspentTxOuts = [
    ...unspentTransactionOut.filter(
      (uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)
    ),
    ...newUnspentTxOuts,
  ];

  unspentTransactionOut = resultingUnspentTxOuts;
};

export const processTransactions = (
  transactions: Transaction[],
  blockIndex: number
) => {
  if (!isValidTransactionsStructure(transactions)) {
    return;
  }

  if (
    !validateBlockTransactions(transactions, unspentTransactionOut, blockIndex)
  ) {
    return;
  }

  updateUnspentTxOuts(transactions);
};
