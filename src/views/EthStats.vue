<template>
    <div>
        <div class="container">
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <CopyDocument class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>网络数</div>
                                <div class="grid-num-1">{{ netNum }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark-light">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <Cpu class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>节点数量</div>
                                <div class="grid-num-1">{{ nodeNum }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <Document class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>最新出块时间</div>
                                <div class="grid-num-1">{{ Math.round(lastBlockTime*10)/10 }}s ago</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark-light">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <Timer class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>平均出块时间</div>
                                <div class="grid-num-1">{{ avgBlockTime }}s</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <Bicycle class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>平均哈希率</div>
                                <div class="grid-num-1">{{ avgHashRate }}H/s</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <PieChart class="grid-con-icon-1" />
                            <div class="grid-cont-right">
                                <div>难度</div>
                                <div class="grid-num-1">{{ difficulty }}</div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="4" class="grid-content-2 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-2 grid-con-1">
                            <Platform class="grid-con-icon-2" />
                            <div class="grid-cont-right">
                                <div>出块节点 <span class="grid-num-2">{{ miningNodeNum }}/{{ nodeNum }}</span></div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-2 ep-bg-purple-dark-light">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-2 grid-con-1">
                            <Coin class="grid-con-icon-2" />
                            <div class="grid-cont-right">
                                <div>GASPRICE<span class="grid-num-2">{{ gasPrice }}wei</span></div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-2 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-2 grid-con-1">
                            <Coin class="grid-con-icon-2" />
                            <div class="grid-cont-right">
                                <div>GASLIMIT<span class="grid-num-2">{{ gasLimit }}gas</span></div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-2 ep-bg-purple-dark-light">
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <div class="grid-cont-right">
                                Block Time
                            </div>
                            <div id="blockTimeChart" style="width: 240px;height: 200px;"></div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="4" class="grid-content-1 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <div class="grid-cont-right">
                                Gas Spending
                            </div>
                            <div id="gasSpendingChart" style="width: 240px;height: 200px;"></div>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="8" class="grid-content-1 ep-bg-purple-dark">
                    <el-card shadow="hover" :body-style="{ padding: '0px' }">
                        <div class="grid-content-1 grid-con-1">
                            <div class="grid-cont-right">
                                LAST BLOCKS MINERS
                                <br />
                                <span class="grid-num-3">
                                    {{ lastBlockMiner }}
                                </span>
                            </div>

                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
        <div class="container">
            <el-table :data="tableData" stripe table-layout="fixed">
                <el-table-column prop="nodeName" label="节点名称">
                    <template #header>
                        <el-icon>
                            <House />
                        </el-icon>节点名称
                    </template>
                </el-table-column>
                <el-table-column prop="nodeLastBlockHash" label="最新块哈希值" width="650">
                    <template #header>
                        <el-icon>
                            <Compass />
                        </el-icon>最新块哈希值
                    </template>
                </el-table-column>
                <el-table-column prop="nodeIsMining" label="出块状态">
                    <template #default="scope" :scope.row.nodeIsMining>
                        <el-tag :type="
                            scope.row.nodeIsMining === 'true'
                                ? 'success'
                                : scope.row.nodeIsMining === 'false'
                                    ? 'danger'
                                    : ''
                        ">{{ scope.row.nodeIsMining }}</el-tag>
                    </template>
                    <template #header>
                        <el-icon>
                            <Loading />
                        </el-icon>出块状态
                    </template>
                </el-table-column>
                <el-table-column prop="nodePeers" label="Peers">
                    <template #header>
                        <el-icon>
                            <Share />
                        </el-icon>Peers
                    </template>
                </el-table-column>
                <el-table-column prop="nodeLastBlock" label="最新块编号">
                    <template #header>
                        <el-icon>
                            <PaperClip />
                        </el-icon>最新块编号
                    </template>
                </el-table-column>
                <el-table-column prop="nodeDifficulty" label="Difficulty">
                    <template #header>
                        <el-icon>
                            <Trophy />
                        </el-icon>Difficulty
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script setup>
import { reactive, onMounted, onUnmounted, ref } from "vue";
import axios from 'axios';
import { ElMessage } from "element-plus";
import * as echarts from 'echarts';
import WebSocket from 'web3/dist/web3.min.js';

const netNum = ref(0);                                  // 网络数量
const nodeNum = ref(0);                                 // 节点数量
const lastBlockTime = ref(0);                           // 最新出块时间
const avgBlockTime = ref(0);                            // 平均出块时间
const blockNum = ref(0);                                // 出块数量
const difficulty = ref(0);                              // 挖矿难度
const avgHashRate = ref(0);                             // 平均哈希率
const miningNodeNum = ref(0);                           // 出块节点数量
const gasPrice = ref(0);                                // gas价格
const gasLimit = ref(0);                                // gas限制
const blockTime = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const gasSpending = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const lastBlockMiner = ref();                           // 最新矿工

const web3Array = ref([]);                              // web3数组，用于保存已有的web3连接

const tableData = ref([]);                              // 列表数据

const nets = ref([]);                                   // 所有网络
//const netNodes = ref([]);                             // 所有节点

let intervalId;
onMounted(() => {
    getNetworksRequest();
    setInterval(() => { lastBlockTime.value += 0.1 }, 100);          // 最新出块时间按秒增加
    intervalId = setInterval(() => { BlockTimeChart(); GasSpendingChart(); updateTableData(); queryGasPrice() }, 1000);
})

onUnmounted(() => {
    clearInterval(intervalId);
})

// 获取网络数量和节点数量
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        var netLength = response.data == null ? 0 : response.data.length;
        netNum.value = netLength;
        nodeNum.value = 0;
        for (let i = 0; i <= netLength - 1; i++) {
            let nodes = [];
            var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
            nodeNum.value += nodesLength;
            for (let j = 0; j <= nodesLength - 1; j++) {
                nodes.push({
                    nodeName: response.data[i].nodes[j].info.name,
                    nodeid: response.data[i].nodes[j].info.id,
                    isMining: '',
                    nodePeer: '',
                    nodeLastBlock: '',
                    nodeDifficulty: '',
                    nodeLastBlockHash: ''
                })
            }
            nets.value.push({                       // 记录下所有网络的网络名称，该网络下的节点id，以及该节点的出块状态
                netName: response.data[i].name,
                nodes: nodes
            })
        }
        webOfNodes();
        ethSubscribe();
        //ethSubscribe();
    }).catch(function (error) {
        ElMessage.error("获取网络信息失败!");
    })

}

// 建立websoket连接
const connectByWebSocket = (netname, nodeid) => {
    let web3;
    if (typeof web3 !== 'undefined') {
        // web3.close();                            // 这不是websocket主动关闭的命令，暂时不设置websocket主动关闭，但是不知道是否有自动回收机制
        web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + netname + '/' + nodeid));
        console.log("websocket连接成功!");
    } else {
        web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + netname + '/' + nodeid));
        console.log("websocket连接成功!");
    }
    return web3;
}

// 订阅出块事件
//let timestamp = 0;
const ethSubscribe = () => {
    // 平均出块时间的计算有问题
    let netsLength = nets.value == null ? 0 : nets.value.length;
    for (let i = 0; i <= netsLength - 1; i++) {
        let nodesLength = nets.value[i].nodes == null ? 0 : nets.value[i].nodes.length;
        for (let j = 0; j <= nodesLength - 1; j++) {
            let web3 = connectByWebSocket(nets.value[i].netName, nets.value[i].nodes[j].nodeid);
            web3.eth.isMining().then(function (value) {
                if (value) {
                    nets.value[i].nodes[j].isMining = 'true';
                    miningNodeNum.value += 1;
                    console.log("web3:" + nets.value[i].netName + '/' + nets.value[i].nodes[j].nodeid);
                    let web3Sub = connectByWebSocket(nets.value[i].netName, nets.value[i].nodes[j].nodeid);
                    var subscription = web3Sub.eth.subscribe('newBlockHeaders', function (error, result) {
                        if (!error) {
                            console.log(result);

                            return;
                        }
                        console.error(error);
                    })
                        .on("connected", function (subscriptionId) {
                            console.log(subscriptionId);
                        })
                        .on("data", function (blockHeader) {
                            blockNum.value += 1;                                                    // 计算区块数量
                            avgBlockTime.value = Math.round((avgBlockTime.value * (blockNum.value - 1) + lastBlockTime.value) / blockNum.value * 100) / 100;      // 计算平均出块时间
                            if (lastBlockTime.value != 0) {
                                blockTime.value[blockTime.value.length] = Math.round(lastBlockTime.value * 100) / 100;      // 计算blockTime
                                blockTime.value.splice(0, 1);
                                avgHashRate.value = Math.round(blockHeader.difficulty / lastBlockTime.value * 100) / 100;     // 计算平均哈希率
                                //     if(timestamp != 0){ 
                                //         avgHashRate.value = Math.round(blockHeader.difficulty / (blockHeader.timestamp - timestamp) * 100) / 100;     // 计算平均哈希率
                                //     }
                                //    timestamp = blockHeader.timestamp;
                            }
                            gasSpending.value[gasSpending.value.length] = blockHeader.gasUsed;
                            gasSpending.value.splice(0, 1);

                            lastBlockTime.value = 0;                                                // 计时器归零
                            difficulty.value = blockHeader.difficulty;                              // 计算difficulty

                            gasLimit.value = blockHeader.gasLimit;                                  // 计算gas限制
                            lastBlockMiner.value = blockHeader.miner;                               // 最新矿工
                            nets.value[i].nodes[j].nodeLastBlock = blockHeader.number;              // 最新区块编号
                            nets.value[i].nodes[j].nodeDifficulty = blockHeader.difficulty;         // 区块difficulty
                            nets.value[i].nodes[j].nodeLastBlockHash = blockHeader.hash;
                        })
                        .on("error", console.error);
                } else {
                    nets.value[i].nodes[j].isMining = 'false';
                }
            });
            web3.eth.net.getPeerCount().then(function (value) {
                nets.value[i].nodes[j].nodePeer = value;
            })
        }
    }

}

// 对每个节点创建一个web3连接
const webOfNodes = () => {
    let netsLength = nets.value == null ? 0 : nets.value.length;
    for (let i = 0; i <= netsLength - 1; i++) {
        let nodesLength = nets.value[i].nodes == null ? 0 : nets.value[i].nodes.length;
        for (let j = 0; j <= nodesLength - 1; j++) {
            web3Array.value.push({
                web3: connectByWebSocket(nets.value[i].netName, nets.value[i].nodes[j].nodeid)
            })
        }
    }
}

// 获取gas price
const queryGasPrice = () => {
    let num = 0;
    if (web3Array.value.length != 0) {
        let netsLength = nets.value == null ? 0 : nets.value.length;
        for (let i = 0; i <= netsLength - 1; i++) {
            let nodesLength = nets.value[i].nodes == null ? 0 : nets.value[i].nodes.length;
            for (let j = 0; j <= nodesLength - 1; j++) {
                web3Array.value[num].web3.eth.getGasPrice().then(function (value) {
                    gasPrice.value = value;
                })
                num++;
            }
        }
    }
}

// 更新列表数据
const updateTableData = () => {
    var netLength = nets.value == null ? 0 : nets.value.length;
    tableData.value.splice(0, tableData.value.length);
    for (let i = 0; i <= netLength - 1; i++) {
        var nodesLength = nets.value[i].nodes == null ? 0 : nets.value[i].nodes.length;
        for (let j = 0; j <= nodesLength - 1; j++) {
            tableData.value.push({
                nodeName: nets.value[i].nodes[j].nodeName,
                nodeLastBlockHash: nets.value[i].nodes[j].nodeLastBlockHash,
                nodeIsMining: nets.value[i].nodes[j].isMining,
                nodePeers: nets.value[i].nodes[j].nodePeer,
                nodeLastBlock: nets.value[i].nodes[j].nodeLastBlock,
                nodeDifficulty: nets.value[i].nodes[j].nodeDifficulty,
                nodeLastBlockTime: '123'
            })
        }
    }
}

// 显示Block Time柱状图
const blockTimeChartDom = ref();
const myblockTimeChart = ref();
const BlockTimeChart = () => {
    if (myblockTimeChart.value != null && myblockTimeChart.value != "" && myblockTimeChart.value != undefined) {
        myblockTimeChart.value.dispose();      //销毁
    }
    blockTimeChartDom.value = document.getElementById('blockTimeChart');
    myblockTimeChart.value = echarts.init(blockTimeChartDom.value);
    var option;
    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none',

            },
            formatter: '{c}'
            // showContent: false
        },
        xAxis: {
            show: false,
            type: 'category',
            silent: true
        },
        yAxis: {
            show: false,
            type: 'value'
        },
        series: [
            {
                data: blockTime.value,
                type: 'bar',
                animation: false
            }
        ]
    };
    option && myblockTimeChart.value.setOption(option);
}

// 显示gasSpending柱状图
const gasSpendingChartDom = ref();
const mygasSpendingChart = ref();
const GasSpendingChart = () => {
    if (mygasSpendingChart.value != null && mygasSpendingChart.value != "" && mygasSpendingChart.value != undefined) {
        mygasSpendingChart.value.dispose();      //销毁
    }
    gasSpendingChartDom.value = document.getElementById('gasSpendingChart');
    mygasSpendingChart.value = echarts.init(gasSpendingChartDom.value);
    var option;
    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'none',

            },
            formatter: '{c}'
            // showContent: false
        },
        xAxis: {
            show: false,
            type: 'category',
            silent: true
        },
        yAxis: {
            show: false,
            type: 'value'
        },
        series: [
            {
                data: gasSpending.value,
                type: 'bar',
                animation: false
            }
        ]
    };
    option && mygasSpendingChart.value.setOption(option);
}
</script>
<style>
.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content-1 {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-content-2 {
    display: flex;
    align-items: center;
    height: 29px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num-1 {
    font-size: 20px;
    font-weight: bold;
}

.grid-num-2 {
    margin-left: 30px;
    font-size: 20px;
    font-weight: bold;
}

.grid-con-icon-1 {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-icon-2 {
    /* 图标显示不出来 */
    font-size: 5px;
    width: 10px;
    height: 10px;
    text-align: center;
    line-height: 10px;
    color: #fff;
}

.grid-num-3 {
    font-size: 20px;
}

.grid-con-1 .grid-con-icon-1 {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num-1 {
    color: rgb(45, 140, 240);
}

.grid-con-1 .grid-num-2 {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon-1 {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num-1 {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-num-2 {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon-1 {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num-1 {
    color: rgb(242, 94, 67);
}

.grid-con-3 .grid-num-2 {
    color: rgb(242, 94, 67);
}

.mgb20 {
    margin-bottom: 20px;
}
</style>
    