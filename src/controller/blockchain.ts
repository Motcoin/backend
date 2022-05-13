import Block,{ genesisBlock, isValidBlockStructure } from "../models/block"
import { makeValidatedBlockchain, addNewBlockToChain ,mineNewBlock, getLastBlock as getLatestBlockFromChain, getComputationalEffort  } from "../models/blockchain"
import { getDifficulty, mine } from '../pow'

let blockchain = makeValidatedBlockchain([genesisBlock])

export const mineBlock = (data :string): Promise<Block | Error> => {
  /**
   * 1. get blockchain
   * 2. get difficulty of blockchain
   * 3. start puzzle with difficulty asynchronously
   * 4. add to blockchain and return
   **/
  const blankBlock = mineNewBlock(blockchain,data);
  const difficulty = getDifficulty(blockchain)
  console.log('start mining');
  return mine({...blankBlock, difficulty}).then((newBlock: Block) => {
    blockchain = addNewBlockToChain(blockchain, newBlock)
    return newBlock
  })
}

export const shouldReplaceChain = (chain: Block[]):boolean => {
  const newBlockchain = makeValidatedBlockchain(chain)
  if(getComputationalEffort(newBlockchain) > getComputationalEffort(blockchain)){
    blockchain = newBlockchain
    return true
  }
  return false
}

export const replaceChain = (chain: Block[]) :boolean => {
  const newBlockchain = makeValidatedBlockchain(chain)
  console.log('we maybe need to replace blockchain.');
  console.table({new: getComputationalEffort(newBlockchain),old:getComputationalEffort(blockchain)});
  
  if(getComputationalEffort(newBlockchain) > getComputationalEffort(blockchain)){
    blockchain = newBlockchain
    return true
  }
  return false
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


