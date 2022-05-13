/* eslint-disable unicorn/prefer-module */
import Block,{calculateHash, makeBlock} from './models/block'
import { getLastBlock } from './models/blockchain'

// in seconds
const BLOCK_GENERATION_INTERVAL = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;

const getAdjustedDifficulty = (latestBlock: Block, chain: Block[]) => {
  const previousAdjustmentBlock: Block = chain[chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken: number = (latestBlock.timestamp - previousAdjustmentBlock.timestamp) / 1000;
  if (timeTaken < timeExpected / 2) {
      console.clear()
      console.log('New Blocks are found very quickly, increasing difficulty')
      console.log({ timeTaken, timeExpected});      
      return previousAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    console.clear()
    console.log('New Blocks are found too slowly, decreasing difficulty')
    console.log({ timeTaken, timeExpected});   
      return previousAdjustmentBlock.difficulty - 1;
  } else {
      return previousAdjustmentBlock.difficulty;
  }
}

export const getDifficulty = (chain: Block[]) => {
  const latestBlock = getLastBlock(chain)
  return latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0 ? getAdjustedDifficulty(latestBlock,chain) : latestBlock.difficulty;
}

import workerpool from 'workerpool'
const pool = workerpool.pool(__dirname + '/mineWorker.js')

export const stopMining = () => pool.terminate(true)
export const mine = (block: Block) => pool.exec('mine',[ block ]).then((response:any) => {
  console.log('done mining',response);
  console.log(pool.stats());
  return response
}) as any
