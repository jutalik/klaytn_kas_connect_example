const Caver = require('caver-js');
require("dotenv").config();
const option = {
    headers: [
        { name: 'Authorization', value: 'Basic ' + Buffer.from(process.env.accessKeyId + ':' + process.env.secretAccessKey).toString('base64') },
        { name: 'x-chain-id', value: 8217 },
    ]
}

const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));


const smartContractExcute = async (_input) => {

    const contract_addr = '0xA92a19561Da6702B5eb7a0F1d21026bB61be743B'
    const contract_abi = [
        {
            "constant": true,
            "inputs": [],
            "name": "Count",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_count",
                    "type": "uint256"
                }
            ],
            "name": "setCount",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

    const contract = new caver.contract(contract_abi, contract_addr)


    let account = caver.klay.accounts.createWithAccountKey(
        process.env.PUB_KEY,
        process.env.PRIV_KEY,
    );

    const abiTransfer = contract.methods.setCount(_input).encodeABI();

    let spender = await caver.wallet.getKeyring(process.env.PUB_KEY);

    if (spender == undefined) {
        try {
            spender = caver.wallet.newKeyring(process.env.PUB_KEY, process.env.PRIV_KEY);
        } catch (err) {
            console.log(err);
        }
    }
    let tokenTransferTx = new caver.transaction.smartContractExecution(
        {
            from: account.address,
            to: contract_addr,
            input: abiTransfer,
            gas: 90000,
        },
    );

    try {
        await caver.wallet.sign(process.env.PUB_KEY, tokenTransferTx);
        const receipt = await caver.rpc.klay.sendRawTransaction(
            tokenTransferTx.getRLPEncoding(),
        );
        console.log(receipt);
        // const TX_HASH = receipt.transactionHash;
        // console.log(TX_HASH);

        // console.log(PER PRICE : ${PerPrice} \nKLAY PRICE : ${KlayPrice})
    } catch (err) {
        console.log(err);
    }

}

smartContractExcute(432143143)