const SHA256 = require("crypto-js/sha256");
const workerpool = require("workerpool");

const calculateHash = (block) => {
  return SHA256(
    block.index +
      block.previousHash +
      block.timestamp +
      block.data +
      block.difficulty +
      block.nonce
  ).toString();
};

const hexToBinary = (hex) => {
  return hex
    .split("")
    .reduce((acc, curr) => (acc += parseInt(curr, 16).toString(2)), "");
};

const hashMatchesDifficulty = (hash, difficulty) => {
  const binaryHash = hexToBinary(hash);
  const requiredPrefix = "0".repeat(difficulty);
  return binaryHash.startsWith(requiredPrefix);
};

const findBlockForWorker = (block) => {
  let nonce = 0;
  let currentBlock = block;
  while (true) {
    currentBlock = { ...block, nonce };
    currentBlock.hash = calculateHash(currentBlock);
    console.log(nonce, ":", currentBlock.hash);
    if (!hashMatchesDifficulty(currentBlock.hash, block.difficulty)) {
      nonce++;
    } else {
      return currentBlock;
    }
  }
};

workerpool.worker({
  mine: findBlockForWorker,
});
