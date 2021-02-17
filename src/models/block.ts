import { SHA256 } from "crypto-js"

export interface IBlock {
  index: number,
  previousHash: string,
  timestamp: number,
  data: string,
  hash?: string
}

export default class Block {
  public hash: string
  public index: number
  public previousHash: string
  public timestamp: number
  public data: string
  constructor(block: IBlock
    ) 
  {
    this.index = block.index
    this.previousHash = block.previousHash
    this.timestamp = block.timestamp
    this.data = block.data
    this.hash = block.hash || this.calculateHash();
  }

  toString(): string {
    return `Block#${this.index}\n` +
      `previous hash: ${this.previousHash ||  'GENESIS_BLOCK'}\n` +
      `hash: ${this.hash}` + 
      `data: {\n ${this.data} \n}\n`
  }

  calculateHash(): string {
    return SHA256(this.index + this.previousHash + this.timestamp + this.data).toString();
  }

  generateNextBlock(data: string): Block {
    const index = this.index + 1
    const previousHash = this.hash
    const timestamp = Date.now()

    return new Block({ index,previousHash,timestamp,data })
  }

  validate(): boolean {
    return this.hash === this.calculateHash()
  }
}

export const isValidBlockStructure = (block: Block): boolean => {
  return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.previousHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string';
};

const genesisStamp = 1613312360254
const genesisData = 'Hello World!, im Tomcoin!'
 
// genesisHash = 'fa24a6c4c5a849abcdebd6c20348f556dc9e99382f4657816178c600abc452f8'
export const genesisBlock: Block = new Block(
  {index: 0, previousHash: '', timestamp: genesisStamp, data: genesisData }
)




