<template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-select v-model="currentNet" placeholder="选择网络" class="handle-select mr10" @change="changeNet()">
                    <el-option v-for="net in nets" :key="net.value" :label="net.value" :value="net.value"></el-option>
                </el-select>
                <el-select v-model="currentNode" placeholder="选择节点" class="handle-select mr10" @change="changeNode()">
                    <el-option v-for="node in nodes" :key="node.name" :label="node.name" :value="node.id"></el-option>
                </el-select>
                <span>api:&nbsp;</span>
                <span>{{ apiOfWeb3 }}</span>
            </div>
            <el-input v-model="textarea" :rows="10" type="textarea" placeholder="显示命令返回值,命令行的使用需要在geth attach前的步骤完成之后"
                readonly resize="none" style="margin-bottom: 10px;" />
            <el-input v-model="inputCommand" placeholder="输入命令" @keydown.enter="runCommand()" />
        </div>
    </div>
   
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from "axios";
import WebSocket from 'web3/dist/web3.min.js';
import createWS from "../utils/websocket.js";

const textarea = ref([]);                           // 显示输入的命令及返回值
const inputCommand = ref([]);                              // 输入命令
const currentNet = ref([]);                         // 当前网络
const nets = reactive([]);                          // 所有网络
const currentNode = ref([]);                        // 当前节点
const nodes = reactive([]);                         // 当前网络下的所有节点
const networksDataFromRequest = ref([]);            // 保存请求结果response
const ws = reactive([]);

// 更换网络，显示对应网络下的节点
const changeNet = () => {
    var netLength = networksDataFromRequest.value.data.length;
    nodes.splice(0, nodes.length);
    for (var i = 0; i <= netLength - 1; i++) {
        if (networksDataFromRequest.value.data[i].name == currentNet.value) {
            //nodes = networksDataFromRequest.value.data[i].nodes;
            var nodesLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
            for (var j = 0; j <= nodesLength - 1; j++) {                        // 遍历节点
                nodes.push({
                    name: networksDataFromRequest.value.data[i].nodes[j].info.name,
                    id: networksDataFromRequest.value.data[i].nodes[j].info.id
                })
            }
        }
    }
}

// 获取节点信息
onMounted(() => {
    getNetworksRequest();
})
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        networksDataFromRequest.value = response;
        var netLength = response.data == null ? 0 : response.data.length;
        nets.splice(0, nets.length);
        for (var i = 0; i <= netLength - 1; i++) {
            nets.push({
                label: response.data[i].name,
                value: response.data[i].name
            })
            if (response.data[i].name == currentNet.value) {
                var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
                for (var j = 0; j <= nodesLength - 1; j++) {                                     // 遍历节点
                    nodes.push({
                        name: response.data[i].nodes[j].info.name,
                        id: response.data[i].nodes[j].info.id
                    })
                }
            }
        }
        nets.sort((x, y) => {
            return x.value > y.value;
        });
    }).catch(function (error) {
        console.log(error);
        ElMessage.error("获取信息失败，请检查网络设置");
    })
}

// 更换节点
const changeNode = () => {
    textarea.value += '[root@localhost~] connect to ' + currentNet.value + '/' + currentNode.value + '\n';
    connectByWebSocket();                         // 每次更换节点都需要更新websocket连接
}

// --------------以下是指令模块--------------
// 按回车键执行指令(字符串匹配)-----------------------------未处理头尾空格TODO
const runCommand = () => {
    let input = inputCommand.value;
    let length = inputCommand.value.length;
    if (input == "clear") {
        clear();
    }
    else if (input == "eth.blockNumber") {
        ethBlockNumber();
    }
    else if (input.slice(0, 13) == "eth.getBlock(" && input.slice(length - 1, length) == ")") {
        ethGetBlock(input.slice(13, length - 1));
    }
    else if (input.slice(0, 19) == "eth.getBlockByHash(" && input.slice(length - 1, length) == ")") {
        ethGetBlockByHash(input.slice(19, length - 1));               // 这个指令并没有完全限制为hash值
    }
    else if (input.slice(0, 21) == "eth.getBlockByNumber(" && input.slice(length - 1, length) == ")") {
        ethGetBlockByNumber(input.slice(21, length - 1));               // 这个指令并没有完全限制为number值
    }
    else if (input.slice(0, 29) == "eth.getBlockTransactionCount(" && input.slice(length - 1, length) == ")") {
        ethGetBlockTransactionCount(input.slice(29, length - 1));
    }
    else if (input.slice(0, 23) == "eth.getBlockUncleCount(" && input.slice(length - 1, length) == ")") {
        ethGetBlockUncleCount(input.slice(23, length - 1));
    }
    else if (input.slice(0, 12) == "eth.getCode(" && input.slice(length - 1, length) == ")") {
        ethGetCode(input.slice(12, length - 1));
    }
    else if (input == "eth.getGasPrice") {
        ethGetGasPrice();
    }
    else if (input == "eth.getHashrate") {
        ethGetHashrate();
    }
    else if (input.slice(0, 19) == "eth.getTransaction(" && input.slice(length - 1, length) == ")") {
        ethGetTransaction(input.slice(19, length - 1));
    }
    else if (input.slice(0, 24) == "eth.getTransactionCount(" && input.slice(length - 1, length) == ")") {
        ethGetTransactionCount(input.slice(24, length - 1));
    }
    else if (input.slice(0, 28) == "eth.getTransactionFromBlock(" && input.slice(length - 1, length) == ")") {
        let headnum = 28;
        let splice;
        for (let i = 0; i < length - (headnum + 1); i++) {
            if (input.slice(headnum + i, headnum + 1 + i) == ',') {
                splice = headnum + i;
                break;
            }
        }
        ethGetTransactionFromBlock(input.slice(headnum, splice), input.slice(splice + 1, length - 1));
    }
    else if (input.slice(0, 26) == "eth.getTransactionReceipt(" && input.slice(length - 1, length) == ")") {
        ethGetTransactionReceipt(input.slice(26, length - 1));
    }
    else if (input == "eth.accounts") {
        ethAccounts();
    }
    else if (input.slice(0, 15) == "eth.getBalance(" && input.slice(length - 1, length) == ")") {
        ethGetBalance(input.slice(15, length - 1));
    }
    // else if (input.slice(0, 19) == "miner.setEtherbase(" && input.slice(length - 1, length) == ")") {
    //     getSetCoinbase(input.slice(19, length - 1));
    // }
    // else if (input == "miner.start()") {
    //     getStartMining();
    // }
    else if (input.slice(0, 25) == "personal.sendTransaction(" && input.slice(length - 1, length) == ")") {
        console.log("start");
        let headnum = 25;
        let splice;
        for (let i = length - (headnum + 1); i > 0; i--) {             //从右向左找逗号，可以考虑直接传入对象试试，这样可能可以不用费劲找逗号了
            if (input.slice(headnum + i, headnum + 1 + i) == ',') {
                splice = headnum + i;
                break;
            }
        }
        // 未允许"
        if (input.slice(splice + 1, splice + 2) == "'" && input.slice(length - 2, length - 1) == "'") {
            let transactionObject = eval("(" + input.slice(25, splice) + ")");           // 一定要加左右括号！！！否则会失败
            console.log(transactionObject);
            personalSendTransaction(transactionObject, input.slice(splice + 2, length - 2));
        }
        else {
            textarea.value += '[root@localhost~] 未找到指令' + '"' + input + '"' + "\n";
        }
    }
    else if (input.slice(0, 22) == "personal.importRawKey(" && input.slice(length - 1, length) == ")") {
        let headnum = 22;
        let splice;
        for (let i = 0; i < length - (headnum + 1); i++) {
            if (input.slice(headnum + i, headnum + 1 + i) == ',') {
                splice = headnum + i;
                break;
            }
        }
        // 未允许"
        if (input.slice(headnum, headnum + 1) == "'" && input.slice(splice - 1, splice) == "'" && input.slice(splice + 1, splice + 2) == "'" && input.slice(length - 2, length - 1)) {
            personalImportRawKey(input.slice(headnum + 1, splice - 1), input.slice(splice + 2, length - 2));
        }
        else {
            textarea.value += '[root@localhost~] 未找到指令' + '"' + input + '"' + "\n";
        }
    }
    else if (input == "net.peerCount") {
        netPeerCount();
    }
    else {
        // let ws = createWS(currentNet.value, currentNode.value);
        // ws.onopen = function () {
        //     console.log('ws onopen: '+input);
        //     ws.send('{json:"eth.accounts"}');
        // };
        // ws.onmessage = function (e) {
        //     console.log('ws onmessage');
        //     console.log('from server: ' + e.data);
        // };
        console.log(input.slice(0, 13));
        console.log(input.slice(length - 1, length));
        console.log(input.slice(13, length - 1));
        textarea.value += '[root@localhost~] 未找到指令' + '"' + inputCommand.value + '"' + "\n";
    }
    clearInput();                               // 做完字符串匹配后清除已输入内容
}

// 按下回车键后清除已输入内容
const clearInput = () => {
    inputCommand.value = '';
}

// 按下上键后回到上次输入的指令


// 清屏指令
const clear = () => {
    textarea.value = '';
}

// 建立websocket连接
let web3;                                       // 初始化web3
const apiOfWeb3 = ref("");
const connectByWebSocket = () => {
    if (typeof web3 !== 'undefined') {
        // web3.close();                        // 这不是websocket主动关闭的命令，暂时不设置websocket主动关闭，但是不知道是否有自动回收机制
        web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value));
        apiOfWeb3.value = 'ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value;
        // web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080'));
        console.log("websocket连接成功!");
    } else {
        web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value));
        // web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080'));
        apiOfWeb3.value = 'ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value;
        console.log("websocket连接成功!");
    }
}

// -------------------eth-------------------
// 返回最新块的编号
const ethBlockNumber = () => {
    web3.eth.getBlockNumber().then(function (value) {
        textarea.value += '[root@localhost~] ' + value + '\n';
    });
}

// 返回指定块
const ethGetBlock = (hashOrNum) => {
    web3.eth.getBlock(hashOrNum).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 返回指定哈希值的块
const ethGetBlockByHash = (hash) => {
    web3.eth.getBlock(hash).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

//  返回指定编号的块
const ethGetBlockByNumber = (num) => {
    web3.eth.getBlock(num).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 返回指定块中的交易数量
const ethGetBlockTransactionCount = (hashOrNum) => {
    web3.eth.getBlockTransactionCount(hashOrNum).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 返回指定块的叔伯数量
const ethGetBlockUncleCount = (hashOrNum) => {
    web3.eth.getBlockUncleCount(hashOrNum).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    })
}

// 返回指定以太坊地址处的代码------------------------------------------------------未验证功能的可行性TODO
const ethGetCode = (codeAddr) => {
    web3.eth.getCode(codeAddr).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    }).catch(function (error) {                                                  // catch用不了TODO
        textarea.value += '[root@localhost~] ' + error + '\n';
    });
}

// 获取当前gas价格，该价格由最近的若干块的gas价格中值决定
const ethGetGasPrice = () => {
    web3.eth.getGasPrice().then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 读取当前挖矿节点的每秒钟哈希值算出数量
const ethGetHashrate = () => {
    web3.eth.getHashrate().then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 
const ethGetHeaderByHash = () => {

}

//
const ethGetHeaderByNumber = () => {

}

// 返回具有指定哈希值的交易对象------------------------------------------------------未验证功能的可行性TODO
const ethGetTransaction = (transactionHash) => {
    web3.eth.getTransaction(transactionHash);
}

// 返回指定地址发出的交易数量------------------------------------------------------未验证功能的可行性TODO
const ethGetTransactionCount = (accountAddr) => {
    web3.eth.getTransactionCount(accountAddr);
}

// 返回指定块中特定索引号的交易对象------------------------------------------------------未验证功能的可行性TODO
const ethGetTransactionFromBlock = (hashStringOrNumber, indexNumber) => {
    web3.eth.getTransactionFromBlock(hashStringOrNumber, indexNumber);
}

// 返回指定交易的收据对象------------------------------------------------------未验证功能的可行性TODO
const ethGetTransactionReceipt = (transactionHash) => {
    web3.eth.getTransactionReceipt(transactionHash);
}

//
const ethSetHead = () => {

}

// 返回当前节点控制的账户列表
const ethAccounts = () => {
    web3.eth.getAccounts().then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 获取指定块中特定账户地址的余额
const ethGetBalance = (accountAddr) => {
    web3.eth.getBalance(accountAddr).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value / 1e18) + '\n';
    });
}


// -------------------personal-------------------
// 将给定的私钥导入密钥存储区，并使用密码对其进行加密     注意：通过不安全的 HTTP RPC 连接发送帐户密码非常危险！！！！！！
const personalImportRawKey = (privateKey, password) => {
    web3.eth.personal.importRawKey(privateKey, password).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// 解锁账户，通过不安全的 HTTP RPC 连接发送帐户密码非常危险!!!!
const personlUnlockAccount = (accountAddr) => {
    web3.eth.personal.unlockAccount(accountAddr);
}

// 向以太坊网络提交一个交易
const personalSendTransaction = (transactionObject, password) => {
    web3.eth.personal.sendTransaction(transactionObject, password).then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    }).catch(function (error) {
        textarea.value += '[root@localhost~] ' + error + '\n';
    });
}


// -------------------net-------------------
// 返回当前节点上已经连接的其他节点数量
const netPeerCount = () => {
    web3.eth.net.getPeerCount().then(function (value) {
        textarea.value += '[root@localhost~] ' + JSON.stringify(value) + '\n';
    });
}

// -------------------其他-------------------
// 为节点设置coinbase
let coinbase;
const getSetCoinbase = (coinbase) => {
    coinbase = coinbase;
}

// 开始出块，要用axios
const getStartMining = () => {
    var url = "/prefix/api/v1/nodes/startmining/" + currentNet.value + "/" + currentNode.value + "?etherbase=" + coinbase;
    axios.get(url, {
        netname: currentNet,
        nodeid: currentNode,
        coinbase: coinbase
    }).then(function (response) {
        textarea.value += '[root@localhost~] startmining...\n';
    }).catch(function (error) {
        textarea.value += '[root@localhost~] startmining failed.\n';
    })
}

// 定义abi

// 定义字节码

// 实例化一个新的合约对象
let myContract;
const newContract = (jsonInterfaceObject) => {
    myContract = new web3.eth.Contract();
    myContract.options.jsonInterface = jsonInterfaceObject;     //这里也许可以将“函数名”提前存起来，在调用合约的时候再遍历？？？好像不太行
}

//  设置合约对象的options属性对象的合约发送方账户地址
const contractOptionsFrom = (fromAddr) => {
    myContract.options.from = fromAddr;
}

//  设置合约对象的options属性对象的合约的字节码
const contractOptionsData = (bytecode) => {
    myContract.options.data = bytecode;
}

// 调用合约，这里的myMethod是一个动态参数，需要根据输入的指令内容进行更改!!!
const callContract = () => {
    myContract.methods.myMethod.call();
}

</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.mr10 {
    margin-right: 10px;
}
</style>