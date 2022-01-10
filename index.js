require("dotenv").config();
const CaverExtKAS = require('caver-js-ext-kas')
const accessKeyId = process.env.accessKeyId
const secretAccessKey = process.env.secretAccessKey

// network id :  cypress 8217 baobab 1001
const caver = new CaverExtKAS(8217, accessKeyId, secretAccessKey)



//// KAS wallet을 사용하여 키를 생성함.
//// 기존 키 생성방식과는 다르게 priv key는 제공되지 않으며 해당 priv key는 카스에서 관리하는 듯
const createAccount = async () => {
    const account = await caver.kas.wallet.createAccount()
    console.log(account)
}

// createAccount()

// 기존 priv키를 kas에서 사용 가능하도록 어카운트 업데이트
const restoreWallet = async () => {
    // 25번 라인까진 키링 컨테이너를 생성하고 키링을 기입.
    const keyringContainer = new caver.keyringContainer()
    const keyring = keyringContainer.keyring.create(process.env.PUB_KEY, process.env.PRIV_KEY)
    keyringContainer.add(keyring)

    const createdKeys = await caver.kas.wallet.createKeys(1)
    const key = createdKeys.items[0]
    // 실제 klaytn network에 어카운트 업데이트tx 전송 
    const updateTx = new caver.transaction.feeDelegatedAccountUpdate({
        from: keyring.address,
        account: caver.account.createWithAccountKeyPublic(keyring.address, key.publicKey),
        gas: 1000000,
    })

    await keyringContainer.sign(keyring.address, updateTx)

    const result = {
        keyId: key.keyId,
        address: keyring.address,
        rlp: updateTx.getRLPEncoding(),
    }

    console.log(result)
}

// restoreWallet()

// smartContractExcute 사용하기
const smartContractExcute = async () => {
    // 심플하게 카운트 겟,셋 하는 컨트랙트
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
    await contract.methods.getCount().call().then((res) => {
        console.log(res)
    })

}

smartContractExcute()