import { SHA256 } from "crypto-js";
import { InvalidHashError } from "./error";
import { Transaction } from "./transaction";

export default interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  data: Transaction[];
  difficulty: number;
  nonce: number;
  hash?: string;
}

export const makeBlock = (block: any): Block => {
  return {
    ...block,
    hash: block.hash || calculateHash(block as Block),
  } as Block;
};

export const printBlock = (block: Block): string => {
  return (
    `Block#${block.index}\n` +
    `previous hash: ${block.previousHash || "GENESIS_BLOCK"}\n` +
    `hash: ${block.hash}` +
    `data: {\n ${block.data} \n}\n`
  );
};

export const calculateHash = (block: Block): string => {
  return SHA256(
    block.index +
      block.previousHash +
      block.timestamp +
      block.data +
      block.difficulty +
      block.nonce
  ).toString();
};

export const generateNextBlock = (block: Block, data: Transaction[]): Block => {
  const index = block.index + 1;
  const previousHash = block.hash || "GENESIS BLOCK!";
  const timestamp = Date.now();

  return { index, previousHash, timestamp, data, difficulty: 0, nonce: 0 };
};

export const validateBlock = (block: Block): boolean => {
  const hash = block.hash === calculateHash(block);
  if (!hash) {
    throw new InvalidHashError(block);
  }
  return true;
};

export const isValidBlockStructure = (block: Block): boolean => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.previousHash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "string"
  );
};

const genesisStamp = 1_613_312_360_254;

const genesisHash =
  "26a177199865033f7906ae31a08ff7eb02399533aff038d11cd578056943bbb2";
const genesisNonce = 56_031;

export const blank: Block = {
  index: 0,
  previousHash: "",
  timestamp: genesisStamp,
  data: [],
  difficulty: 5,
  nonce: genesisNonce,
  hash: genesisHash,
};

export const genesisBlock = blank;
