import Block, { genesisBlock, isValidBlockStructure } from "../models/block";
import {
  makeValidatedBlockchain,
  addNewBlockToChain,
  mineNewBlock,
  getLastBlock as getLatestBlockFromChain,
  getComputationalEffort,
} from "../models/blockchain";
import { getEther, removeFromEther } from "../models/ether";
import { getCoinbaseTransaction } from "../models/transaction";
import { getDifficulty, mine } from "../pow";
import { nodeKeyPair } from "../wallets/gen-key";

let blockchain = makeValidatedBlockchain([genesisBlock]);

export const handleNewBlock = (newBlock: Block) => {
  blockchain = addNewBlockToChain(blockchain, newBlock);

  const transactions = newBlock.data;
  removeFromEther(transactions);

  return newBlock;
};

export const mineBlock = (): Promise<Block | Error> => {
  /**
   * 1. get difficulty of blockchain
   * 2. build coinbase transaction
   * 3. get transactions from ether
   * 4. add to blockchain and return
   **/

  const coinbaseTransaction = getCoinbaseTransaction(
    nodeKeyPair.pub,
    getLatestBlock().index + 1
  );
  const regularTransactions = getEther();

  const blankBlock = mineNewBlock(blockchain, [
    coinbaseTransaction,
    ...regularTransactions,
  ]);
  const difficulty = getDifficulty(blockchain);
  console.log("start mining");
  return mine({ ...blankBlock, difficulty }).then(handleNewBlock);
};

export const shouldReplaceChain = (chain: Block[]): boolean => {
  const newBlockchain = makeValidatedBlockchain(chain);
  if (
    getComputationalEffort(newBlockchain) > getComputationalEffort(blockchain)
  ) {
    blockchain = newBlockchain;
    return true;
  }
  return false;
};

export const replaceChain = (chain: Block[]): boolean => {
  const newBlockchain = makeValidatedBlockchain(chain);
  console.log("we maybe need to replace blockchain.");
  console.table({
    new: getComputationalEffort(newBlockchain),
    old: getComputationalEffort(blockchain),
  });

  if (
    getComputationalEffort(newBlockchain) > getComputationalEffort(blockchain)
  ) {
    blockchain = newBlockchain;
    return true;
  }
  return false;
};

export const addBlockToChain = (block: Block) => {
  if (!isValidBlockStructure(block)) {
    console.log("Bad block structure");
    return false;
  }
  blockchain = addNewBlockToChain(blockchain, block);
  //questionable if this should be here
  removeFromEther(block.data);
  return true;
};

export const getBlockchain = () => {
  return blockchain;
};

export const getLatestBlock = (): Block => {
  return getLatestBlockFromChain(blockchain);
};
