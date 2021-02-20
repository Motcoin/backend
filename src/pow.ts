import { rejects } from 'assert';
import Block,{calculateHash, makeBlock} from './models/block'
import { getLastBlock } from './models/blockchain'
import { getOtherNodeFoundHash,setOtherNodeFoundHash } from './p2p'

const HASH_FUNCTION_CALLS_PER_NODE_EVENT_CYCLE = 1000;

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

const hexToBinary = (hex: string):string => {
  return hex.split('').reduce((acc,curr) => acc += parseInt(curr,16).toString(2),'')
}

export const hashMatchesDifficulty = (hash: string, difficulty: number) => {
  const binaryHash = hexToBinary(hash)
  const requiredPrefix = '0'.repeat(difficulty)
  return binaryHash.startsWith(requiredPrefix)
}

const getAdjustedDifficulty = (latestBlock: Block, chain: Block[]) => {
  const prevAdjustmentBlock: Block = chain[chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken: number = (latestBlock.timestamp - prevAdjustmentBlock.timestamp) / 1000;
  if (timeTaken < timeExpected / 2) {
      console.clear()
      console.log('New Blocks are found very quickly, increasing difficulty')
      console.log({ timeTaken, timeExpected});      
      return prevAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    console.clear()
    console.log('New Blocks are found too slowly, decreasing difficulty')
    console.log({ timeTaken, timeExpected});   
      return prevAdjustmentBlock.difficulty - 1;
  } else {
      return prevAdjustmentBlock.difficulty;
  }
}

export const getDifficulty = (chain: Block[]) => {
  const latestBlock = getLastBlock(chain)
  if(latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0){
    return getAdjustedDifficulty(latestBlock,chain)
  } else {
    return latestBlock.difficulty
  }
}


//calculate HASH_FUNCTION_CALLS_PER_NODE_EVENT_CYCLE amount of hashes then
//resume wiht the cycle and queue the next 1000 for next cycle
export const findBlock = (block: Block): Promise<Block> =>  {
  return new Promise((resolve,reject) => {
    let nonce = 0
    let currentBlock = block
    let foundHash = false
    const findNonce = () => {
      let counter = 0;
      while(counter < HASH_FUNCTION_CALLS_PER_NODE_EVENT_CYCLE) {
        currentBlock = { ...block, nonce }
        currentBlock.hash = calculateHash(currentBlock)
        console.log(nonce,':',currentBlock.hash);
        if(getOtherNodeFoundHash()){
          setOtherNodeFoundHash(false)
          return reject('Some other node found it.')
        }
        if(!hashMatchesDifficulty(currentBlock.hash, block.difficulty)){
          nonce++
        } else {
          foundHash = true
        }
        counter++
      }
      if(foundHash){
        console.log('Found hash: ', currentBlock.hash);
        return resolve(makeBlock({ ...currentBlock, hash: calculateHash(currentBlock)}))
      } else {
        setImmediate(findNonce)
      }
    }
    console.log('Find hash...');
    findNonce()
  })
}