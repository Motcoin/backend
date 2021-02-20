import Block, { validateBlock, generateNextBlock, calculateHash } from "./block"

export enum InvalidNewBlockErrorType {
  HASH,
  PREVIOUS_HASH,
  INDEX,
  TIMESTAMP
}

export const printInvalidBlocktError = (newBlock: Block, previousBlock: Block|undefined, type: InvalidNewBlockErrorType) => {
  console.error('Block Invalid!')
  console.table(newBlock)
  switch(type){
    case InvalidNewBlockErrorType.HASH: {
      console.error('Invalid Hash of new Block:')
      console.table({ is: newBlock.hash, shouldBe: calculateHash(newBlock)})
      break
    }
    case InvalidNewBlockErrorType.PREVIOUS_HASH: {
      console.error('Invalid Previous Hash')
      console.table({ is: newBlock.hash, shouldBe: previousBlock?.hash })
      break
    }
    case InvalidNewBlockErrorType.INDEX: {
      console.error('Invalid index')
      console.table({is: newBlock.index, shouldBe: previousBlock?.index || 0 + 1})
    }
    case InvalidNewBlockErrorType.TIMESTAMP: {
      console.error('New Blocks Timestamp is invalid')
      console.table({ new: newBlock.timestamp, prev: previousBlock?.timestamp  })
    }
  }
}

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
  const printErr = (type: InvalidNewBlockErrorType) => printInvalidBlocktError(newBlock,previousBlock,type)
  result &&= newBlock.previousHash === previousBlock.hash
  if(!result){
    printErr(InvalidNewBlockErrorType.PREVIOUS_HASH)
    return result
  }

  result &&= isValidTimestamp(newBlock,previousBlock)
  if(!result) {
    printErr(InvalidNewBlockErrorType.TIMESTAMP)
    return result
  }

  result &&= newBlock.index === previousBlock.index + 1
  if(!result){
    printErr(InvalidNewBlockErrorType.INDEX)
    return result
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

type ValidatedBlockchain = Block[]
export const makeValidatedBlockchain = (chain: Block[]) => {
  if(validateBlockchain(chain)){
    return chain as ValidatedBlockchain
  } else {
    throw Error('Chain is not valid.')
  }
}


