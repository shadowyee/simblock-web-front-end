<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 连接状态图
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <span style="margin-right:10px">选择网络</span>
                <el-select v-model="currentNet" filterable @change="changeNet()">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <span style="margin-right:10px; margin-left:30px">连接</span>
                <el-select v-model="node1" filterable>
                    <el-option v-for="node in nodes" :key="node.value" :label="node.label" :value="node.value" />
                </el-select>
                <span style="margin-right:10px; margin-left:10px">和</span>
                <el-select v-model="node2" filterable>
                    <el-option v-for="node in nodes" :key="node.value" :label="node.label" :value="node.value" />
                </el-select>
                <el-button type="primary" style="margin-left: 10px;" @click="connectSelectedNodes()">连接</el-button>
            </div>
            <div id="stateChart" style="width: auto;height: 700px;"></div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { ElMessage } from "element-plus";
import { useManageNetStore } from '../store/managenet';

const options = reactive([])                        // 下拉框选项
const nodes = reactive([]);                         // 当前网络下的节点
const node1 = ref([]);                              // 需要连接的节点1(select绑定值只能使用ref,不能使用reactive)
const node2 = ref([]);                              // 需要连接的节点2
const networksDataFromRequest = ref([]);            // 保存请求结果response
const currentNodesOfNet = ref([]);                  // 保存当前网络下的所有节点信息
const managenetStore = useManageNetStore();
const currentNet = ref(managenetStore.netName);     // 当前仿真网络
const chartData = ref([]);                          // 网状图中的数据
const chartLink = ref([]);                          // 网状图中的连接情况


// 更换网络
const changeNet = () => {
    var netLength = networksDataFromRequest.value.data.length;
    //tableData.value.splice(0, tableData.value.length);
    chartData.value.splice(0, chartData.value.length);
    chartLink.value.splice(0, chartLink.value.length);
    nodes.splice(0, nodes.length);
    for (var i = 0; i <= netLength - 1; i++) {
        if (networksDataFromRequest.value.data[i].name == currentNet.value) {
            currentNodesOfNet.value = networksDataFromRequest.value.data[i].nodes;
            var nodesLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
            for (var j = 0; j <= nodesLength - 1; j++) {                        // 遍历节点
                nodes.push({
                    label: networksDataFromRequest.value.data[i].nodes[j].info.name,
                    value: networksDataFromRequest.value.data[i].nodes[j].info.name
                })
                chartData.value.push({
                    name: networksDataFromRequest.value.data[i].nodes[j].info.name,
                    x: Math.round(j * Math.random() * 100),
                    y: Math.round(j * Math.random() * 100)
                })
            }
            var connsLength = networksDataFromRequest.value.data[i].conns == null ? 0 : networksDataFromRequest.value.data[i].conns.length;
            for (var q = 0; q <= connsLength - 1; q++) {                            // 遍历networksDataFromRequest.value中的conns中的conns
                if (networksDataFromRequest.value.data[i].conns[q].up.toString() == "true") {
                    for (var m = 0; m <= nodesLength - 1; m++) {                            // 遍历节点
                        if (networksDataFromRequest.value.data[i].nodes[m].info.id == networksDataFromRequest.value.data[i].conns[q].one) {
                            for (var n = 0; n <= nodesLength - 1; n++) {                    // 遍历节点
                                if (networksDataFromRequest.value.data[i].nodes[n].info.id == networksDataFromRequest.value.data[i].conns[q].other) {
                                    chartLink.value.push({
                                        source: networksDataFromRequest.value.data[i].nodes[m].info.name,
                                        target: networksDataFromRequest.value.data[i].nodes[n].info.name
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    managenetStore.setNetName(currentNet.value);
    connectStateChart();
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
        options.splice(0, options.length);
        for (var i = 0; i <= netLength - 1; i++) {
            options.push({
                label: response.data[i].name,
                value: response.data[i].name
            })
            if (response.data[i].name == currentNet.value) {
                currentNodesOfNet.value = response.data[i].nodes;
                var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
                for (var j = 0; j <= nodesLength - 1; j++) {                                     // 遍历节点
                    nodes.push({
                        label: response.data[i].nodes[j].info.name,
                        value: response.data[i].nodes[j].info.name
                    })
                    chartData.value.push({
                        name: response.data[i].nodes[j].info.name,
                        x: Math.round(j * Math.random() * 100),
                        y: Math.round(j * Math.random() * 100)
                    })
                }
                var connsLength = response.data[i].conns == null ? 0 : response.data[i].conns.length;
                for (var q = 0; q <= connsLength - 1; q++) {                                    // 遍历response中的conns中的conns
                    if (response.data[i].conns[q].up.toString() == "true") {
                        for (var m = 0; m <= nodesLength - 1; m++) {                            // 遍历节点
                            if (response.data[i].nodes[m].info.id == response.data[i].conns[q].one) {
                                for (var n = 0; n <= nodesLength - 1; n++) {                    // 遍历节点
                                    if (response.data[i].nodes[n].info.id == response.data[i].conns[q].other) {
                                        chartLink.value.push({
                                            source: response.data[i].nodes[m].info.name,
                                            target: response.data[i].nodes[n].info.name
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        options.sort((x, y) => {
            return x.value > y.value;
        });
        connectStateChart();
    }).catch(function (error) {
        ElMessage.error("获取信息失败，请检查网络设置");
    })
}

// 连接选中的两个节点
const connectSelectedNodes = () => {
    var node1id;
    var node2id;
    if (node1.value != '' && node2.value != '') {
        if (node1.value !== node2.value) {
            var nodesLength = currentNodesOfNet.value.length;
            for (var i = 0; i <= nodesLength - 1; i++) {
                if (currentNodesOfNet.value[i].info.name == node1.value) {
                    node1id = currentNodesOfNet.value[i].info.id;
                } else if (currentNodesOfNet.value[i].info.name == node2.value) {
                    node2id = currentNodesOfNet.value[i].info.id;
                }
            }
            getNodesConnectRequest(node1id, node2id);

        } else {
            ElMessage.error("不能连接两个相同的节点!");
        }
    } else {
        ElMessage.error("节点不能为空!")
    }
}
const getNodesConnectRequest = (node1Id, node2Id) => {
    var url = "/prefix/api/v1/nodes/connect/" + currentNet.value + "/" + node1Id + "/" + node2Id;              //查询网络接口
    axios.get(url, {
        netname: currentNet.value,
        node1id: node1Id,
        node2id: node2Id
    }).then(function (response) {
        chartLink.value.push({
            source: node1.value,
            target: node2.value
        })
        connectStateChart();
        ElMessage.success("连接成功!");
    }).catch(function (error) {
        ElMessage.error("连接失败!");
    })
}


// 显示节点连接网络图
var chartDom;
var myChart;
const connectStateChart = () => {
    if (myChart != null && myChart != "" && myChart != undefined) {
        myChart.dispose();      //销毁
    }
    chartDom = document.getElementById('stateChart');
    myChart = echarts.init(chartDom);
    var option;
    option = {
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                type: 'graph',
                layout: 'circular',                     // 环形布局
                symbolSize: 40,
                animation: false,
                roam: true,
                label: {
                    show: true
                },
                // force: {
                //     initLayout: 'circular',
                //     gravity: 0,
                //     //repulsion: 100,              //排斥力
                //     edgeLength: 5,
                //     layoutAnimation: true
                // },
                data: chartData.value,
                links: chartLink.value,
            }
        ]
    };
    option && myChart.setOption(option);
}
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 210px;
    display: inline-block;
}

.table {
    width: 100%;
    font-size: 14px;
}

.red {
    color: #ff0000;
}

.mr10 {
    margin-right: 10px;
}

.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>