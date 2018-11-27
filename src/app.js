const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const Blockchain = require('../src/blockchain');
const butcoin = new Blockchain();

app.get('/blockchain', (req, res) => {
    res.send(butcoin);
});

app.get('/mine/:miner', (req, res) => {
    const latestBlock = butcoin.getLatestBlock();
    const prevBlockHash = latestBlock.hash;
    const currentBlockData = {
        transactions: butcoin.pendingTransactions,
        index: latestBlock.index + 1
    }
    const nonce = butcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = butcoin.hashBlock(prevBlockHash, currentBlockData, nonce);

    butcoin.makeNewTransaction(1, '00000', req.params.miner); // mining reward

    const newBlock = butcoin.creatNewBlock(nonce, prevBlockHash, blockHash)
    res.json({ message: 'Mining new Block successfully!', newBlock });
});

app.post('/transaction', (req, res) => {
    const blockIndex = butcoin.makeNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.json({ message: `Transaction is added to block with index: ${blockIndex}` });
});

app.listen('8080', () => {
    console.log('>>> Server Started at port : 8080');
});