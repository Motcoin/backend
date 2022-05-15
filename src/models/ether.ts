import { Transaction } from "./transaction";

export let ether: Transaction[] = [];

export const addToEther = (transaction: Transaction) => {
  ether.push(transaction);
};

export const removeFromEther = (transactions: Transaction[]) => {
  const idsToBeFiltered = new Set(transactions.map((t) => t.id));
  ether = ether.filter((t) => !idsToBeFiltered.has(t.id));
};

export const getEther = () => {
  return ether;
};
