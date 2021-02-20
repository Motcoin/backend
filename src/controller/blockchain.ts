import Block,{ genesisBlock, isValidBlockStructure } from "../models/block"
import { makeValidatedBlockchain, addNewBlockToChain ,mineNewBlock, getLastBlock as getLatestBlockFromChain, getComputationalEffort  } from "../models/blockchain"
import { getDifficulty, findBlock } from '../pow'

let blockchain = makeValidatedBlockchain([genesisBlock])

let isMining = false
export const getIsMining = () => isMining
export const mineBlock = (data :string): Promise<Block|void> => {
  /**
   * 1. get blockchain
   * 2. get difficulty of blockchain
   * 3. start puzzle with difficulty
   * 4. add to blockchain and return
   **/
  const blankBlock = mineNewBlock(blockchain,data);
  const difficulty = getDifficulty(blockchain)
  isMining = true
  console.log('start mining');
  return findBlock({ ...blankBlock, difficulty }).then(newBlock => {
    blockchain = addNewBlockToChain(blockchain, newBlock)
    isMining = false
    console.log('done mining, found hash');
    return newBlock
  }).catch((reason) => {
    console.log(reason);
    isMining = false
  })
}

export const replaceChain = (chain: Block[]) => {
  const newBlockchain = makeValidatedBlockchain(chain);
  console.log('we maybe need to replace blockchain.');
  console.table({new: getComputationalEffort(newBlockchain),old:getComputationalEffort(blockchain)});
  
  if(getComputationalEffort(newBlockchain) > getComputationalEffort(blockchain)){
    blockchain = newBlockchain
  }
}

export const addBlockToChain = (block: Block) => {
  if(!isValidBlockStructure(block)){
    console.log("Bad block structure");
    return false
  }
  blockchain = addNewBlockToChain(blockchain,block)
  return true
}

export const getBlockchain = () => {
  return blockchain
}

export const getLatestBlock = (): Block => {
  return getLatestBlockFromChain(blockchain)
}


