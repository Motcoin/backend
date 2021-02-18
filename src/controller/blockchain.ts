import Block,{ genesisBlock, isValidBlockStructure } from "../models/block"
import { makeValidatedBlockchain, addNewBlockToChain ,mineNewBlock, getLastBlock as getLatestBlockFromChain  } from "../models/blockchain"
import { getDifficulty, findBlock } from '../pow'

let blockchain = makeValidatedBlockchain([genesisBlock])

export const mineBlock = (data :string): Block => {
  /**
   * 1. get blockchain
   * 2. get difficulty of blockchain
   * 3. start puzzle with difficulty
   * 4. add to blockchain and return
   **/
  const blankBlock = mineNewBlock(blockchain,data);
  const difficulty = getDifficulty(blockchain)
  const newBlock = findBlock({ ...blankBlock, difficulty })
  blockchain = addNewBlockToChain(blockchain, newBlock)
  return newBlock
}

export const replaceChain = (chain: Block[]) => {
  const newBlockchain = makeValidatedBlockchain(chain);
  if(newBlockchain.length > blockchain.length){
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


