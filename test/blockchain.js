const Blockchain = require('../src/blockchain');

function mine(blockChain) {
    console.log('>>> Mining............');
    const latestBlock = blockChain.getLatestBlock();
    const prevBlockHash = latestBlock.hash;
    const currentBlockData = {
        transactions: blockChain.pendingTransactions,
        index: latestBlock.index + 1
    }
    const nonce = blockChain.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = blockChain.hashBlock(prevBlockHash, currentBlockData, nonce);

    blockChain.makeNewTransaction(1, '00000', 'miningNode'); // mining reward

    console.log('>>> Create new Block:\n', blockChain.creatNewBlock(nonce, prevBlockHash, blockHash));
}

const butcoin = new Blockchain();

console.log('>>> Create new Blockchain:\n', butcoin);

butcoin.makeNewTransaction(121, 'ELEPHANT', 'MONKEY');

mine(butcoin);

butcoin.makeNewTransaction(1326, 'ELEPHANT', 'MONKEY');
butcoin.makeNewTransaction(622, 'MONKEY', 'ELEPHANT');
butcoin.makeNewTransaction(1598, 'ELEPHANT', 'MONKEY');

mine(butcoin);

console.log('>>> Current Blockchain Data:\n', butcoin);