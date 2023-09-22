// import { useTransactionsStore } from '../store/transactions.js';
// import { useGasPriceStore } from '../store/gasPrice.js';
// import { useAccountsStore } from '../store/accounts.js';

// const transactions = useTransactionsStore();
// const gasPrice = useGasPriceStore();
// const accounts = useAccountsStore();

export function getGasPrice(ws) {
    ws.onopen = function () {
        console.log('ws onopen');
        ws.send('{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":73}');
    };
    ws.onmessage = function (e) {
        console.log('ws onmessage');
        const dataJson = eval("(" + e.data + ")");
        const data1 = parseInt(dataJson.result) / 1e9;
        const gas = data1.toFixed(2);
        console.log(gas)
    };
}

export function sendTransaction(ws, net, node, transObj) {
    ws.onopen = function () {
        ws.send('{"jsonrpc":"2.0","method":"eth_sendTransaction","params":[' + transObj + '],"id":1}');
    };
    ws.onmessage = function (e) {
        const transHash = eval("(" + e.data + ")").result;
        if (transHash === 0) {
            state = false;
        } else {
            state = true;
        }
        if (transHash.to === "") {
            flag = false;
        } else {
            flag = true;
        }
        transactions.setTransItem(net, node, transHash, state, flag);
    };
}

export function getReceiptList(ws) {
    let transaction = [];
    for (let i = 0; i < transactions.transNum; i++) {
        ws.onopen = function () {
            ws.send('{"jsonrpc":"2.0","method":"eth_getTransactionReceipt","params":["' + transactions.list[i] + '"],"id":1}');
        };
        ws.onmessage = function (e) {
            const dataJson = eval("(" + e.data + ")");
            transaction.push(dataJson.result);
        };
    }
    return transaction;
}

export function registAccount(ws, net, node, keydata, passphrase) {
    ws.onopen = function () {
        console.log("onopen");
        ws.send(`{"method":"personal_importRawKey","params":["${keydata}", "${passphrase}"],"id":1,"jsonrpc":"2.0"}`);
    };
    ws.onmessage = function (e) {
        console.log("onmessage:")
        const dataJson = eval("(" + e.data + ")");
        accounts.setAccount(net, node, dataJson.result, keydata, passphrase);
    };
}

function compileSolidity(ws, code, callback) {
    ws.onopen = function () {
        ws.send(`{"jsonrpc":"2.0","method":"eth_compileSolidity","params":[${code}]}`);
    }
    ws.onmessage = function (e) {
        const dataJson = eval("(" + e.data + ")");
        const resultJson = eval("(" + dataJson.result + ")");
        callback(resultJson.code);
    }
}


function getCoinBase(ws, callback) {
    ws.onopen = function () {
        ws.send('{"jsonrpc":"2.0","method":"eth_coinbase","id":1}');
    }
    ws.onmessage = function (e) {
        const dataJson = eval("(" + e.data + ")");
        const coinBase = dataJson.result;
        callback(coinBase);
    }
}

export function send(ws, net, node, data, flag) {
    ws.onopen = function () {
        this.getCoinBase(ws, coinbase => {
            ws.send(`{"jsonrpc":"2.0","method":"personal_importRawKey","params":[${coinbase}, ${passphrase}]}`);
        })
    }
    ws.onmessage = function (e) {

    }
        .then(() => {
            if (!flag) {
                compileSolidity(ws, data, code => this.sendTransaction(ws, net, node, getCoinBase(ws, coinBase =>
                    `[{"from":"${coinBase}","data:${code}"}]`)))
            }
            else {
                this.sendTransaction(ws, net, node, getCoinBase(ws, coinBase =>
                    `[{"from":"${coinBase}","data:${data}"}]`))
            }
        })
        .catch(err => console.log(err));
}