<template>
  <div class="contract">
    <div class="handle-box">
      <el-select v-model="currentNet" placeholder="选择网络" class="handle-select mr10" @change="changeNet()">
        <el-option v-for="net in nets" :key="net.value" :label="net.value" :value="net.value">
        </el-option>
      </el-select>
      <el-select v-model="currentNode" placeholder="选择节点" class="handle-select mr10" @change="changeNode()">
        <el-option v-for="node in nodes" :key="node.name" :label="node.name" :value="node.id">
        </el-option>
      </el-select>
      <el-button type="primary" @click="dialogVisible=true">
        部署合约
      </el-button>
      <span class="deploy-tip">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;智能合约的部署和调用，需要确保节点正在执行挖矿操作，否则会执行失败</span>
      <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
        <el-table-column prop="transHash" label="合约"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" @click="runContract(scope.row)">
              <el-icon style="vertical-align: middle">
                <Pointer />
              </el-icon>
              <span style="vertical-align:middle">调用</span>
            </el-button>
            <el-button type="primary" @click="getInfo(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div>
      <el-dialog title="字节码部署" v-model="byteVisible" width="50">
        <el-form label-width="120px">
          <el-form-item label="合约abi">
            <el-input v-model="abicode" placeholder="Please input abi"></el-input>
          </el-form-item>
          <el-form-item label="合约字节码">
            <el-input v-model="bytecode" placeholder="Please input bytecode"></el-input>
          </el-form-item>
          <el-form-item label="合约构造参数">
            <el-input v-model="contractParams" placeholder="合约构造函数参数值，使用逗号隔开" />
          </el-form-item>
          <el-form-item label="发送方地址">
            <el-input v-model="tmpAddr" placeholder="Please input" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="byteVisible=false">取 消</el-button>
            <el-button type="primary" @click="sendAsByte()">部 署</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="dialogVisible" width="30%">
        <el-form label-width="120px">
          <el-form-item label="选择节点">
            <el-input v-model="currentNode" disabled />
          </el-form-item>
          <el-form-item label="出块账户密码">
            <el-input v-model="nodepwd" type="password" placeholder="请输入密码" autocomplete="off" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="setByteVisible()">输入代码</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="inputDialog" width="30%">
        <el-form label-width="120px">
          <el-form-item label="调用函数名称">
            <el-input v-model="methodName" placeholder="请输入函数名称" />
          </el-form-item>
          <el-form-item label="发送方地址">
            <el-input v-model="tmpAddr" placeholder="输入地址" />
          </el-form-item>
          <el-form-item label="函数参数">
            <el-input v-model="argsList" placeholder="输入函数参数，使用逗号隔开" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="nodepwd" type="password" placeholder="请输入密码，若无参数则不需要输入" autocomplete="off" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="inputDialog = false">取 消</el-button>
            <el-button @click="run()">调 用</el-button>
          </span>
        </template>
      </el-dialog>

      <el-dialog v-model="contractInfoVisible" width="80%">
        <el-descriptions title="调用信息" direction="horizontal" column="1" border>
          <el-descriptions-item label="executionResult">{{ contractInfo.executionResult }}</el-descriptions-item>
          <el-descriptions-item label="blockHash">{{ contractInfo.blockHash }}</el-descriptions-item>
          <el-descriptions-item label="blockNumber">{{ contractInfo.blockNumber }}</el-descriptions-item>
          <el-descriptions-item label="contractAddress">{{ contractInfo.contractAddress }}</el-descriptions-item>
          <el-descriptions-item label="cumulativeGasUsed">{{ contractInfo.cumulativeGasUsed }}</el-descriptions-item>
          <el-descriptions-item label="effectiveGasPrice">{{ contractInfo.effectiveGasPrice }}</el-descriptions-item>
          <el-descriptions-item label="from">{{ contractInfo.from }}</el-descriptions-item>
          <el-descriptions-item label="gasUsed">{{ contractInfo.gasUsed }}</el-descriptions-item>
          <el-descriptions-item label="logs">{{ contractInfo.logs }}</el-descriptions-item>
          <!-- <el-descriptions-item label="logsBloom">{{ transferInfo.logsBloom }}</el-descriptions-item> -->
          <el-descriptions-item label="status">{{ contractInfo.status }}</el-descriptions-item>
          <el-descriptions-item label="to">{{ contractInfo.to }}</el-descriptions-item>
          <el-descriptions-item label="transactionHash">{{ contractInfo.transactionHash }}</el-descriptions-item>
          <el-descriptions-item label="transactionIndex">{{ contractInfo.transactionIndex }}</el-descriptions-item>
          <el-descriptions-item label="type">{{ contractInfo.type }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <el-dialog v-model="infoVisible" width="80%">
        <el-descriptions title="合约详情" direction="horizontal" column="1" border>
          <el-descriptions-item label="blockHash">{{ info.blockHash }}</el-descriptions-item>
          <el-descriptions-item label="blockNumber">{{ info.blockNumber }}</el-descriptions-item>
          <el-descriptions-item label="contractAddress">{{ info.contractAddress }}</el-descriptions-item>
          <el-descriptions-item label="cumulativeGasUsed">{{ info.cumulativeGasUsed }}</el-descriptions-item>
          <el-descriptions-item label="effectiveGasPrice">{{ info.effectiveGasPrice }}</el-descriptions-item>
          <el-descriptions-item label="from">{{ info.from }}</el-descriptions-item>
          <el-descriptions-item label="gasUsed">{{ info.gasUsed }}</el-descriptions-item>
          <el-descriptions-item label="logs">{{ info.logs }}</el-descriptions-item>
          <!-- <el-descriptions-item label="logsBloom">{{ transferInfo.logsBloom }}</el-descriptions-item> -->
          <el-descriptions-item label="status">{{ info.status }}</el-descriptions-item>
          <el-descriptions-item label="to">{{ info.to }}</el-descriptions-item>
          <el-descriptions-item label="transactionHash">{{ info.transactionHash }}</el-descriptions-item>
          <el-descriptions-item label="transactionIndex">{{ info.transactionIndex }}</el-descriptions-item>
          <el-descriptions-item label="type">{{ info.type }}</el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import WebSocket from 'web3/dist/web3.min.js';
import { useContractStore } from "../store/contract.js";
import { useTransactionsStore } from "../store/transactions.js";


// 建立web3协议
let web3;
const createWeb = () => {
  web3 = new WebSocket(new WebSocket.providers.WebsocketProvider(`ws://${location.hostname}:8080/api/v1/nodes/rpc/` + currentNet.value + '/' + currentNode.value));
  console.log("websocket连接成功!");
}

const contract = useContractStore();
const transactions = useTransactionsStore();

// 列表数据
const tableData = ref([]) as any;

onMounted(() => {
  getNetworksRequest();
});

// 从后端获取网络与节点
const networksDataFromRequest = ref([]) as any;            // 保存请求结果response
const currentNet = ref([]) as any;                         // 当前网络
const nets = reactive([]) as any;                          // 所有网络
const currentNode = ref([]) as any;                        // 当前节点
const nodes = reactive([]) as any;                         // 当前网络下的所有节点         
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
// 更换节点
const changeNode = () => {
  createWeb();                         // 每次更换节点都需要更新websocket连接
  updateContractList();
}

const updateContractList = () => {
  const l = [] as any;
  const contractList = JSON.parse(JSON.stringify(contract.list))
  for (let i = 0; i < contract.list.length; i++) {
    if (contractList[i].node == currentNode.value) {
      l.push(contractList[i]);
    }
  }
  tableData.value = l
}

// 部署合约
const dialogVisible = ref(false);
const contractParams = ref("");
const byteVisible = ref(false);
const nodepwd = ref("");

const bytecode = ref("");
const abicode = ref("");

const hash = ref('') as any;
const contractAdr = ref('') as any;
const receipts = ref() as any
const tmpAddr = ref('') as any;

const setByteVisible = () => {
  byteVisible.value = true;
  web3.eth.getCoinbase().then(coinbase => {
    tmpAddr.value = coinbase;
  })
}

const sendAsByte = () => {
  const abicodeJSON = JSON.parse(abicode.value);

  // https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html
  let myContract = new web3.eth.Contract(abicodeJSON);
  web3.eth.personal.unlockAccount(tmpAddr.value, nodepwd.value, 600).then(() => {
    myContract.deploy({
      data: bytecode.value,
      arguments: contractParams.value.split(",")
    }).send({
      from: tmpAddr.value,
      gas: '3000000'
    }).on('error', function (error) {
      console.log(error);
      ElMessage('部署失败');
    }).on('transactionHash', function (transactionHash) {
      console.log(transactionHash);
      hash.value = transactionHash;
      ElMessage('部署中');
    }).on('receipt', function (receipt) {
      console.log(receipt);
      receipts.value = receipt;
      ElMessage('部署成功');
      dialogVisible.value = false;
      byteVisible.value = false;
    }).then(function (newContractInstance) {
      contractAdr.value = newContractInstance.options.address;
      console.log(newContractInstance.options.address) // instance with the new contract address
      contract.setContractItem({
        "net": currentNet.value,
        "node": currentNode.value,
        "transHash": hash.value,
        "contractAdr": contractAdr.value,
        "receipts": receipts.value,
        "abi": abicode.value,
        "bytecode": bytecode.value
      });
      transactions.setTransItem(currentNet.value, currentNode.value, hash.value);
      updateContractList();
    })
  });
}

const argsList = ref("");
const methodName = ref('');
const inputDialog = ref(false)
const currentAbi = ref() as any;
const currentContract = ref() as any;
const contractInfo = ref();
const contractInfoVisible = ref(false);
const runContract = (row) => {
  inputDialog.value = true;
  currentAbi.value = row.abi;
  currentContract.value = row.contractAdr
  web3.eth.getCoinbase().then(coinbase => {
    tmpAddr.value = coinbase;
  })
}

const run = () => {
  const abi = JSON.parse(currentAbi.value);
  let contractInstance = new web3.eth.Contract(abi, currentContract.value);
  if (argsList.value == null || argsList.value == "") {
    eval(`contractInstance.methods.${methodName.value}().call().then(value => {
      console.log(value);
      ElMessage(value);
    })`)
  }
  else {
    const fn = eval(`contractInstance.methods.${methodName.value}`);
    const args = argsList.value.split(",");
    if (typeof fn === 'function') {
      try {
        web3.eth.getCoinbase().then(coinbase => tmpAddr.value = coinbase)
          .then(setTimeout(function () {
            web3.eth.personal.unlockAccount(tmpAddr.value, nodepwd.value, 3000);
            console.log(nodepwd.value)
            // 获取合约执行返回值
            let returnValue = ""
            fn(...args).call({ from: tmpAddr.value }, (error, result) => {
                if (!error) {
                    returnValue = result;
                    console.log(returnValue)
                } else {
                    console.error(error);
                }
            });
            fn.apply(this, args).send({
              from: tmpAddr.value
            }).then(value => {
              contractInfoVisible.value = true;
              contractInfo.value = value;
              contractInfo.value.executionResult = returnValue
              console.log(contractInfo.value)
              transactions.setTransItem(currentNet.value, currentNode.value, contractInfo.value.transactionHash);
            })
          }, 100))
      }
      catch (ex) {
        console.log(ex);
        ElMessage.error("failed" + ex)
      }
    }
  }
}

// 合约详情
const infoVisible = ref(false);
const info = ref();
const getInfo = (row) => {
  infoVisible.value = true;
  info.value = row.receipts;
}
</script>

<style scoped>
.table {
  width: 100%;
  font-size: 14px;
}

.handle-box {
  margin-bottom: 20px;
  .deploy-tip {
      color: red;
  }
}

.handle-select {
  width: 120px;
}

.mr10 {
  margin-right: 10px;
}
</style>
