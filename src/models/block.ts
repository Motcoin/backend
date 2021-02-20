import { SHA256 } from "crypto-js"
import { printInvalidBlocktError,InvalidNewBlockErrorType } from "./blockchain"

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

export const validateBlock = (block: Block): boolean => {
  const hash = block.hash === calculateHash(block)
  if(!hash){
    printInvalidBlocktError(block, undefined,InvalidNewBlockErrorType.HASH)
    return false
  }
  return true
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
const genesisHash = '00000e44726feba3bd3d363ed7103c90bddd6008ebf266da1aca91894c64a5cb'
const genesisNonce = 56031

export const blank: Block = {index: 0, previousHash: '', timestamp: genesisStamp, data: genesisData, difficulty: 5, nonce: genesisNonce, hash: genesisHash }

// import { findBlock } from "../pow"

export const genesisBlock = blank
console.log('found!',genesisBlock);





