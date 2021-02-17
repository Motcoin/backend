import Block from "./block"

const isValidNewBlock = (newBlock: Block, previousBlock: Block | undefined): boolean => {
  let result = true;
  result &&= newBlock.validate()
  if(!previousBlock){
    return result
  }

  if(!result){
    console.log('invalid hash');
    return result
  }

  result &&= newBlock.previousHash === previousBlock.hash
  if(!result){
    console.log('invalid previous hash!');
    return result
  }

  result &&= newBlock.index === previousBlock.index + 1
  if(!result){
    console.log('invalid index!');
    return result
  }

  return result
}

const istValidGenesisBlock = (genesis: Block) => isValidNewBlock(genesis, undefined)


export const getLastBlock = (chain: Block[]): Block => {
  return new Block(chain[chain.length - 1])
}

export const mineNewBlock = (chain: ValidatedBlockchain, data: string): Block => {
  const lastBlock = getLastBlock(chain)
  const newBlock = lastBlock.generateNextBlock(data)
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
  const newBlock = new Block(block)
  return isValidNewBlock(newBlock,getLastBlock(chain))
    ? chain.concat([block])
    : chain
}


type ValidatedBlockchain = Block[]
export const makeValidatedBlockchain = (chain: Block[]) => {
  if(validateBlockchain(chain)){
    return chain as ValidatedBlockchain
  } else {
    throw Error('Chain is not valid.')
  }
}


