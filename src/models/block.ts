import { SHA256 } from "crypto-js"

export default class Block {
  public hash: string
  constructor(
    public index: number,
    public previousHash: string,
    public timestamp: number,
    public data: string) 
  {
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return SHA256(this.index + this.previousHash + this.timestamp + this.data).toString();
  }

  generateNextBlock(data: string): Block {
    const index = this.index + 1
    const previousHash = this.hash
    const timestamp = Date.now()

    return new Block(index,previousHash,timestamp,data)
  }

  validate(): boolean {
    return this.hash === this.calculateHash()
  }
}



const genesisStamp = 1613312360254
const genesisData = 'Hello World!, im Tomcoin!'
 
// genesisHash = 'fa24a6c4c5a849abcdebd6c20348f556dc9e99382f4657816178c600abc452f8'
export const genesisBlock: Block = new Block(
  0, '', genesisStamp, genesisData
)




