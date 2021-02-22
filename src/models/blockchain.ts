import Block, { validateBlock, generateNextBlock } from "./block"
import { InvalidHashError, InvalidIndexError, InvalidPreviousHashError, InvalidTimestampError } from './error'

const isValidTimestamp = (newBlock: Block, previousBlock: Block) => {
  const newT = newBlock.timestamp / 1000
  const prevT = previousBlock.timestamp / 1000
  const now = Date.now() / 1000
  if(!previousBlock){
    return true
  } else {
    return  prevT - 60 < newT && newT - 60 < now
  }
}

const isValidNewBlock = (newBlock: Block, previousBlock: Block | undefined): boolean => {
  let result = true;
  result &&= validateBlock(newBlock)
  
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

const istValidGenesisBlock = (genesis: Block) => isValidNewBlock(genesis, undefined)


export const getLastBlock = (chain: Block[]): Block => {
  return chain[chain.length - 1]
}

export const mineNewBlock = (chain: ValidatedBlockchain, data: string): Block => {
  const lastBlock = getLastBlock(chain) 
  const newBlock = generateNextBlock(lastBlock,data)
  return newBlock
}

export const validateBlockchain = (chain: Block[]): boolean => {
  let result = true
  result &&= istValidGenesisBlock(chain[0])
  if(!result){
    console.log('invalid genesis block');
  }
  for(let i = 1; i < chain.length && result; i++){
    result &&= isValidNewBlock(chain[i],chain[i-1])
  }
  return result
}

export const addNewBlockToChain = (chain: ValidatedBlockchain, block: Block): ValidatedBlockchain => {
  return isValidNewBlock(block,getLastBlock(chain))
    ? chain.concat([block])
    : chain
}

export const getComputationalEffort = (chain: ValidatedBlockchain) => {
  return chain.reduce((acc,curr) => acc += Math.pow(2,curr.difficulty),0)
}

export type ValidatedBlockchain = Block[]
export const makeValidatedBlockchain = (chain: Block[]) => {
  try{
    validateBlockchain(chain)
    return chain as ValidatedBlockchain
  } catch(e) {
    console.error(e)
    return []
  }
}


