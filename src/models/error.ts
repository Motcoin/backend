import Block, { calculateHash } from "./block";

export class InvalidHashError extends Error {
  constructor(public block: Block) {
    super();
  }
  toString(): string {
    return `Invalid Hash!\nis: ${this.block.hash}\nshould be: ${calculateHash(
      this.block
    )}`;
  }
}

export class InvalidPreviousHashError extends Error {
  constructor(public block: Block, public previousBlock: Block) {
    super();
  }
  toString(): string {
    return `Invalid Previous Hash!\nis: ${this.block.previousHash}\nshould be: ${this.previousBlock.hash}`;
  }
}

export class InvalidIndexError extends Error {
  constructor(public block: Block, public previousBlock: Block) {
    super();
  }
  toString(): string {
    return `Invalid Index!\nis: ${this.block.index}\nshould be: ${
      this.previousBlock.index + 1
    }`;
  }
}

export class InvalidTimestampError extends Error {
  constructor(public block: Block, public previousBlock: Block) {
    super();
  }
  toString(): string {
    return `Invalid Timestamp!\nis: ${this.block.timestamp}\nshould be: >= ${
      this.previousBlock.index - 60_000
    } && <= ${Date.now() + 60_000}`;
  }
}
