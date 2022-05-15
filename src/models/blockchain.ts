import Block, { validateBlock, generateNextBlock } from "./block"
import { InvalidIndexError, InvalidPreviousHashError, InvalidTimestampError } from './error'
import { processTransactions, Transaction } from "./transaction"

const isValidTimestamp = (newBlock: Block, previousBlock: Block) => {
  const newT = newBlock.timestamp / 1000
  const previousT = previousBlock.timestamp / 1000
  const now = Date.now() / 1000
  return !previousBlock ? true : previousT - 60 < newT && newT - 60 < now;
}

const isValidNewBlock = (newBlock: Block, previousBlock?: Block): boolean => {
  let result = validateBlock(newBlock)
  
  if(!previousBlock){
    return result
  }

  if(!result){
    return result
 
  }
  result &&= newBlock.previousHash === previousBlock.hash
  if(!result){
    throw new InvalidPreviousHashError(newBlock, previousBlock)
  }

  result &&= isValidTimestamp(newBlock,previousBlock)
  if(!result) {
    throw new InvalidTimestampError(newBlock,previousBlock)
  }

  result &&= newBlock.index === previousBlock.index + 1
  if(!result){
    throw new InvalidIndexError(newBlock,previousBlock)
  }
  return result
}

const isValidGenesisBlock = (genesis: Block) => isValidNewBlock(genesis)


export const getLastBlock = (chain: Block[]): Block => {
  return chain[chain.length - 1]
}

export const mineNewBlock = (chain: ValidatedBlockchain, data: Transaction[]): Block => {
  const lastBlock = getLastBlock(chain) 
  const newBlock = generateNextBlock(lastBlock,data)
  return newBlock
}

export const validateBlockchain = (chain: Block[]): boolean => {
  let result = isValidGenesisBlock(chain[0])
  if(!result){
    console.log('invalid genesis block');
  }
  for(let index = 1; index < chain.length && result; index++){
    result &&= isValidNewBlock(chain[index],chain[index-1])
  }
  return result
}

export const addNewBlockToChain = (chain: ValidatedBlockchain, block: Block): ValidatedBlockchain => {
  if(!isValidNewBlock(block,getLastBlock(chain))){
    return chain
  }

  processTransactions(block.data, block.index);

  return [...chain, block]
}

export const getComputationalEffort = (chain: ValidatedBlockchain) => {
  return chain.map(chainElement => Math.pow(2,chainElement.difficulty)).reduce((total,value) => total + value)
}


export type ValidatedBlockchain = Block[]
export const makeValidatedBlockchain = (chain: Block[]) => {
  try{
    validateBlockchain(chain)
    return chain as ValidatedBlockchain
  } catch(error) {
    console.error(error)
    return []
  }
}


