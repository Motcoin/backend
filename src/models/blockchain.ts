import Block from "./block"

export default class Blockchain {
  static isValidNewBlock = (newBlock: Block, previousBlock: Block | undefined): boolean => {
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
  
  static istValidGenesisBlock = (genesis: Block) => Blockchain.isValidNewBlock(genesis, undefined)
  
  static isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'string';
  };

  private blockchain: Block[]
  constructor(genesisBlock: Block){
    this.blockchain = [genesisBlock];
  }

  getBlockchain(): Block[]{
    return this.blockchain
  }

  getLastBlock(): Block{
    return this.blockchain[this.blockchain.length - 1]
  }

  mineNewBlock(data: string){
    const lastBlock = this.getLastBlock()
    const newBlock = lastBlock.generateNextBlock(data)
    this.blockchain.push(newBlock)
    return newBlock
  }

  validateBlockchain(): boolean{
    let result = true
    result &&= Blockchain.istValidGenesisBlock(this.blockchain[0])
    if(!result){
      console.log('invalid genesis block');
    }
    for(let i = 1; i < this.blockchain.length && result; i++){
      result &&= Blockchain.isValidNewBlock(this.blockchain[i], this.blockchain[i-1])
    }
    return result
  }
}