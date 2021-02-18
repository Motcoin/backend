import { SHA256 } from "crypto-js"

export default interface Block {
  index: number,
  previousHash: string,
  timestamp: number,
  data: string,
  difficulty: number,
  nonce: number,
  hash?: string
}

export const makeBlock = ( block: any ) :Block => {
  return {
    ...block,
    hash: block.hash || calculateHash(block as Block)
  } as Block
}

export const printBlock = (block: Block): string => {
  return `Block#${block.index}\n` +
    `previous hash: ${block.previousHash ||  'GENESIS_BLOCK'}\n` +
    `hash: ${block.hash}` + 
    `data: {\n ${block.data} \n}\n`
}

export const calculateHash = (block: Block): string => {
  return SHA256(block.index + block.previousHash + block.timestamp + block.data + block.difficulty + block.nonce).toString();
}

export const generateNextBlock = (block: Block, data: string): Block => {
  const index = block.index + 1
  const previousHash = block.hash || "GENESIS BLOCK!"
  const timestamp = Date.now()

  return({ index,previousHash,timestamp,data, difficulty: 0, nonce: 0 })
}

const isValidTimestamp = (timestamp: number) => {
  return timestamp <= Date.now() + 6000 && timestamp >= Date.now() - 6000
}

const isGenesis = (block: Block) => {
  return !block.previousHash
}

export const validateBlock = (block: Block): boolean => {
  return block.hash === calculateHash(block) && (isValidTimestamp(block.timestamp) || isGenesis(block))
}

export const isValidBlockStructure = (block: Block): boolean => {
  return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.previousHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string';
};

const genesisStamp = 1613312360254
const genesisData = 'Hello World!, im Tomcoin!'

// genesisHash = 'fa24a6c4c5a849abcdebd6c20348f556dc9e99382f4657816178c600abc452f8'
export const blank: Block = {index: 0, previousHash: '', timestamp: genesisStamp, data: genesisData, difficulty: 2, nonce: 0 }

import { findBlock } from "../pow"

export const genesisBlock = findBlock(blank)




