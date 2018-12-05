const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid/v1'),
    nodeAddr = uuid(),
    reqPromise = require('request-promise');

const port = process.argv[2];

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

// decentralize

app.post('/register-node', (req, res) => { // single node register
    const nodeUrl = req.body.nodeUrl;

    if ((butcoin.nodeUrl != nodeUrl) && (butcoin.networkNodes.indexOf(nodeUrl) == -1)) {
        butcoin.networkNodes.push(nodeUrl);
        res.json({ message: 'node registered successfully' });
    } else {
        res.json({ message: 'node cannot be registered' });
    }

});

app.post('/register-bulk-nodes', (req, res) => { // bulk node register
    const networkNodes = req.body.networkNodes;

    networkNodes.forEach(nodeUrl => {
        if ((butcoin.nodeUrl != nodeUrl) && (butcoin.networkNodes.indexOf(nodeUrl) == -1)) {
            butcoin.networkNodes.push(nodeUrl);
        }
    });

    res.json({ message: 'Bulk register successful' });

});

app.post('/register-and-broadcast-node', (req, res) => { // register and broadcast one node
    const nodeUrl = req.body.nodeUrl;

    if (butcoin.networkNodes.indexOf(nodeUrl) == -1) {
        butcoin.networkNodes.push(nodeUrl);
    }

    const registerNodes = []

    butcoin.networkNodes.forEach(networkNode => {
        const requestOptions = {
            uri: networkNode + '/register-node',
            method: 'POST',
            body: { nodeUrl: nodeUrl },
            json: true
        }

        registerNodes.push(reqPromise(requestOptions));
    });

    Promise.all(registerNodes)
        .then(data => {
            const bulkRegisterOption = {
                uri: nodeUrl + '/register-bulk-nodes',
                method: 'POST',
                body: { networkNodes: [...butcoin.networkNodes, butcoin.nodeUrl] },
                json: true
            }

            return reqPromise(bulkRegisterOption);
        }).then(data => {
            res.json('node registered to network successfully');
        });
});

app.listen(port, () => {
    console.log('>>> Server Started at port :' + port);
});