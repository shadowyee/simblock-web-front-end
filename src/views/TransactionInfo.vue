<template>
    <div>
        <el-row :gutter="20">
            <el-col>
                <el-row :gutter="20" class="mgb20">
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-1">
                                <Odometer class="grid-con-icon" />
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ netNum }}</div>
                                    <div>网络数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-2">
                                <Promotion class="grid-con-icon" />
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ nodeNum }}</div>
                                    <div>节点数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{ padding: '0px' }">
                            <div class="grid-content grid-con-3">
                                <Histogram class="grid-con-icon" />
                                <div class="grid-cont-right">
                                    <div class="grid-num">{{ transNum }}</div>
                                    <div>转账数</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <div class="container">
                    <div class="handle-box">
                        <el-select v-model="currentNet" placeholder="选择网络" class="handle-select mr10"
                            @change="changeNet()">
                            <el-option v-for="net in nets" :key="net.value" :label="net.value" :value="net.value">
                            </el-option>
                        </el-select>
                        <el-select v-model="currentNode" placeholder="选择节点" class="handle-select mr10"
                            @change="changeNode()">
                            <el-option v-for="node in nodes" :key="node.name" :label="node.name" :value="node.id">
                            </el-option>
                        </el-select>
                    </div>
                    <el-table :data="tableData" border class="table" ref="multipleTable"
                        header-cell-class-name="table-header">
                        <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                        <el-table-column prop="transHash" label="交易哈希"></el-table-column>
                        <el-table-column prop="net" label="所属网络"></el-table-column>
                        <el-table-column prop="node" label="所属节点"></el-table-column>
                        <el-table-column label="操作" align="center">
                            <template #default="scope">
                                <el-button type="primary" key="primary" @click="infoDialog(scope.$index)">详情</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-dialog v-model="infoDialogVisible" width="80%">
                        <el-descriptions title="转账详情" direction="horizontal" column="1" border>
                            <el-descriptions-item label="blockHash">{{ transferInfo.blockHash }}</el-descriptions-item>
                            <el-descriptions-item label="blockNumber">{{ transferInfo.blockNumber }}</el-descriptions-item>
                            <el-descriptions-item label="contractAddress">{{ transferInfo.contractAddress }}</el-descriptions-item>
                            <el-descriptions-item label="cumulativeGasUsed">{{ transferInfo.cumulativeGasUsed }}</el-descriptions-item>
                            <el-descriptions-item label="effectiveGasPrice">{{ transferInfo.effectiveGasPrice }}</el-descriptions-item>
                            <el-descriptions-item label="from">{{ transferInfo.from }}</el-descriptions-item>
                            <el-descriptions-item label="gasUsed">{{ transferInfo.gasUsed }}</el-descriptions-item>
                            <el-descriptions-item label="logs">{{ transferInfo.logs }}</el-descriptions-item>
                            <!-- <el-descriptions-item label="logsBloom">{{ transferInfo.logsBloom }}</el-descriptions-item> -->
                            <el-descriptions-item label="status">{{ transferInfo.status }}</el-descriptions-item>
                            <el-descriptions-item label="to">{{ transferInfo.to }}</el-descriptions-item>
                            <el-descriptions-item label="transactionHash">{{ transferInfo.transactionHash }}</el-descriptions-item>
                            <el-descriptions-item label="transactionIndex">{{ transferInfo.transactionIndex }}</el-descriptions-item>
                            <el-descriptions-item label="type">{{ transferInfo.type }}</el-descriptions-item>
                        </el-descriptions>
                    </el-dialog>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { reactive, onMounted, ref } from "vue";
import { ElMessage } from 'element-plus';
import WebSocket from 'web3/dist/web3.min.js';
import { useTransactionsStore } from '../store/transactions.js';
import { useNetNodeStore } from "../store/netNode.js";
import { assert } from "console";

// 建立web3协议
let web3;
const createWeb = () => {
    web3 = new WebSocket(new WebSocket.providers.WebsocketProvider(`ws://${location.hostname}:8080/api/v1/nodes/rpc/` + currentNet.value + '/' + currentNode.value));
    console.log("websocket连接成功!");
}

const netNodeStore = useNetNodeStore();

const netNum = ref(0);
const nodeNum = ref(0)

const transaction = useTransactionsStore();
const transNum = ref(0);

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
        netNum.value = netLength;
        nets.splice(0, nets.length);
        for (var i = 0; i <= netLength - 1; i++) {
            nets.push({
                label: response.data[i].name,
                value: response.data[i].name
            })
            setTransactionNum(response.data[i].nodes);
            nodeNum.value += response.data[i].nodes.length;
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
    updateTransactionList();
}

const updateTransactionList = () => {
    const l = [] as any;
    const accountList = JSON.parse(JSON.stringify(transaction.list))
    console.log(accountList[8])
    for (let i = 0; i < transaction.list.length; i++) {
        if (accountList[i].node == currentNode.value) {
            l.push(accountList[i]);
        }
    }
    tableData.value = l
}

const setTransactionNum = (nodes) => {
    const accountList = JSON.parse(JSON.stringify(transaction.list));
    let flag = false;
    for (let i = 0; accountList[i] != undefined; i++) {
        {
            for (let j = 0; j < nodes.length; j++) {
                if (accountList[i].node == nodes[j].info.id) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                accountList.splice(i, 1);
                i--;
            }
            flag = false;
        }
    }
    transNum.value = accountList.length;
}


const transferInfo = ref({}) as any;

const infoDialogVisible = ref(false);
const infoDialog = (index) => {
    infoDialogVisible.value = true;
    web3.eth.getTransactionReceipt(tableData.value[index].transHash).then(function (value) {
        console.log(value)
        transferInfo.value = value;
    })
    console.log(transferInfo.value);
}
</script>

<style scoped>
.grid-content {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 20px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.mgb20 {
    margin-bottom: 20px;
}

.table {
    width: 100%;
    font-size: 14px;
}

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
