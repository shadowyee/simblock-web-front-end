<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 管理网络
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <span style="margin-right:10px">选择网络</span>
                <el-select v-model="currentNet" filterable @change="changeNet()">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-input style="margin-left: 50px" v-model="searchByName" placeholder="节点ID" class="handle-input mr10"
                    @keyup.delete="handleSearch()"></el-input>
                <el-button type="primary" @click="handleSearch()">
                    <el-icon>
                        <Search />
                    </el-icon>&nbsp搜索
                </el-button>
                <el-button style="margin-left: 40px;" type="primary" key="primary" @click="jumpToConnectStateChart()" link>
                    查看节点连接图</el-button>
            </div>
            <el-table :data="tableData" border class="table" header-cell-class-name="table-header">
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="node1id" label="节点1ID"></el-table-column>
                <el-table-column prop="node2id" label="节点2ID"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template #default="scope">
                        <el-tag :type="
                            scope.row.connsState === '已连接'
                                ? 'success'
                                : scope.row.connsState === '未连接'
                                    ? 'danger'
                                    : ''
                        ">{{ scope.row.connsState }}</el-tag>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="操作" width="300" align="center">
                    <template #default="scope"><el-button @click="getRow(scope.row)">test</el-button></template>
                </el-table-column> -->
                <el-table-column label="操作" width="300" align="center">
                    <template #default="scope">
                        <el-button type="primary" key="primary" @click="
                scope.row.connsState === '已连接'
                    ? disconnectNode(scope.row.node1id, scope.row.node2id)
                    : scope.row.connsState === '未连接'
                        ? connectNode(scope.row.node1id, scope.row.node2id)
                        : 'error'" link>
                            {{ scope.row.connsState === '已连接' ? '断开连接' : scope.row.connsState === '未连接' ? '建立连接' :
                                    'error'
                            }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="nodesData.pageIndex"
                    :page-size="nodesData.pageSize" :total="pageTotal" @current-change="handlePageChange">
                </el-pagination>
            </div> -->
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useManageNetStore } from '../store/managenet';
import axios from 'axios';
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const options = reactive([                          //下拉框选项
])
const router = useRouter();
const managenetStore = useManageNetStore();
const tableData = ref([]);                           //表格信息
const currentNet = ref(managenetStore.netName);      //当前仿真网络
const nodesData = reactive({                         //表格页数(未使用)
    pageIndex: 1,
    pageSize: 10
});
const multipleSelection = ref([]);                  //已选择的表格行对象(感觉有些地方可以用typescript限制一下输入类型)
const networksDataFromRequest = ref([]);            //保存请求结果response
const searchByName = ref('');                       //搜索输入，默认值为空

// 更换网络
const changeNet = () => {
    var netLength = networksDataFromRequest.value.data.length;
    tableData.value.splice(0, tableData.value.length);
    for (var i = 0; i <= netLength - 1; i++) {
            if (networksDataFromRequest.value.data[i].name == currentNet.value) {
                var nodesLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
                for (var j = 0; j <= nodesLength - 1; j++) {                        // 遍历节点
                    for (var k = j + 1; k <= nodesLength - 1; k++) {                    // 遍历节点
                        var connsState = "未连接";
                        var connsLength = networksDataFromRequest.value.data[i].conns == null ? 0 : networksDataFromRequest.value.data[i].conns.length;
                        for (var p = 0; p <= connsLength - 1; p++) {            // 遍历networksDataFromRequest.value中的conns
                            if (networksDataFromRequest.value.data[i].nodes[j].info.id == networksDataFromRequest.value.data[i].conns[p].one && networksDataFromRequest.value.data[i].nodes[k].info.id == networksDataFromRequest.value.data[i].conns[p].other) {
                                connsState = networksDataFromRequest.value.data[i].conns[p].up == true ? "已连接" : "未连接";
                            } else if (networksDataFromRequest.value.data[i].nodes[j].info.id == networksDataFromRequest.value.data[i].conns[p].other && networksDataFromRequest.value.data[i].nodes[k].info.id == networksDataFromRequest.value.data[i].conns[p].one) {
                                connsState = networksDataFromRequest.value.data[i].conns[p].up == true ? "已连接" : "未连接";
                            }
                        }
                        tableData.value.push({
                            node1id: networksDataFromRequest.value.data[i].nodes[j].info.id,
                            node2id: networksDataFromRequest.value.data[i].nodes[k].info.id,
                            connsState: connsState
                        })
                    }
                }
            }
        }
    managenetStore.setNetName(currentNet.value);
}

// 获取节点信息
onMounted(() => {
    getNetworksRequest();
})
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        console.log("response:");
        console.log(response);
        networksDataFromRequest.value = response;
        var netLength = response.data == null ? 0 : response.data.length;
        options.splice(0, options.length);
        for (var i = 0; i <= netLength - 1; i++) {
            options.push({
                label: response.data[i].name,
                value: response.data[i].name
            })
            if (response.data[i].name == currentNet.value) {
                var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
                for (var j = 0; j <= nodesLength - 1; j++) {                                            // 遍历节点
                    for (var k = j + 1; k <= nodesLength - 1; k++) {                                    // 遍历节点
                        var connsState = "未连接";
                        var connsLength = response.data[i].conns == null ? 0 : response.data[i].conns.length;
                        for (var p = 0; p <= connsLength - 1; p++) {                                    // 遍历response中的conns
                            if (response.data[i].nodes[j].info.id == response.data[i].conns[p].one && response.data[i].nodes[k].info.id == response.data[i].conns[p].other) {
                                connsState = response.data[i].conns[p].up == true ? "已连接" : "未连接";
                            } else if (response.data[i].nodes[j].info.id == response.data[i].conns[p].other && response.data[i].nodes[k].info.id == response.data[i].conns[p].one) {
                                connsState = response.data[i].conns[p].up == true ? "已连接" : "未连接";
                            }
                        }
                        tableData.value.push({
                            node1id: response.data[i].nodes[j].info.id,
                            node2id: response.data[i].nodes[k].info.id,
                            connsState: connsState
                        })
                    }
                }
            }
        }
        options.sort((x, y) => {
            return x.value > y.value;
        });
    }).catch(function (error) {
        ElMessage.error("获取信息失败，请检查网络设置");
    })
}

// 建立连接
const connectNode = (node1Id, node2Id) => {
    var node1UpState;
    var node2UpState;
    var length = networksDataFromRequest.value == null ? 0 : networksDataFromRequest.value.data.length;
    for (var i = 0; i <= length - 1; i++) {
        if (networksDataFromRequest.value.data[i].name == currentNet.value) {
            var nodeLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
            for (var j = 0; j <= nodeLength - 1; j++) {
                if (networksDataFromRequest.value.data[i].nodes[j].info.id == node1Id) {
                    //console.log(networksDataFromRequest.value.data[i].nodes[j].up);
                    if (networksDataFromRequest.value.data[i].nodes[j].up.toString() == "false") {
                        node1UpState = "false";
                        ElMessage.error("节点1未启动!");
                    }
                    else {
                        node1UpState = "true";
                    }
                } else if (networksDataFromRequest.value.data[i].nodes[j].info.id == node2Id) {
                    if (networksDataFromRequest.value.data[i].nodes[j].up.toString() == "false") {
                        node2UpState = "false";
                        ElMessage.error("节点2未启动!");
                    }
                    else {
                        node2UpState = "true";
                    }
                }
            }
        }
    }
    if (node1UpState == "true" && node2UpState == "true") {
        getNodesConnectRequest(node1Id, node2Id);
    }
}
const getNodesConnectRequest = (node1Id, node2Id) => {
    console.log("connect:");
    console.log('/prefix/api/v1/nodes/connect/' + currentNet.value + '/' + node1Id + '/' + node2Id);
    axios.get('/prefix/api/v1/nodes/connect/' + currentNet.value + '/' + node1Id + '/' + node2Id, {
        netname: currentNet.value,
        node1id: node1Id,
        node2id: node2Id
    }).then(function (response) {
        ElMessage.success("建立连接成功!");
        tableData.value.splice(0, tableData.value.length);
        getNetworksRequest();
    }).catch(function (error) {
        ElMessage.error("建立连接失败!" + error);
    })
}

// 断开连接
const disconnectNode = (node1Id, node2Id) => {
    var node1UpState;
    var node2UpState;
    var length = networksDataFromRequest.value == null ? 0 : networksDataFromRequest.value.data.length;
    for (var i = 0; i <= length - 1; i++) {
        if (networksDataFromRequest.value.data[i].name == currentNet.value) {
            var nodeLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
            for (var j = 0; j <= nodeLength - 1; j++) {
                if (networksDataFromRequest.value.data[i].nodes[j].info.id == node1Id) {
                    console.log(networksDataFromRequest.value.data[i].nodes[j].up);
                    if (networksDataFromRequest.value.data[i].nodes[j].up.toString() == "false") {
                        node1UpState = "false";
                        ElMessage.error("节点1未启动!");
                    }
                    else {
                        node1UpState = "true";
                    }
                } else if (networksDataFromRequest.value.data[i].nodes[j].info.id == node2Id) {
                    if (networksDataFromRequest.value.data[i].nodes[j].up.toString() == "false") {
                        node2UpState = "false";
                        ElMessage.error("节点2未启动!");
                    }
                    else {
                        node2UpState = "true";
                    }
                }
            }
        }
    }
    if (node1UpState == "true" && node2UpState == "true") {
        getNodesDisconnectRequest(node1Id, node2Id);
    }

}
const getNodesDisconnectRequest = (node1Id, node2Id) => {
    console.log("disconnect:");
    console.log('/prefix/api/v1/nodes/disconnect/' + currentNet.value + '/' + node1Id + '/' + node2Id);
    axios.get('/prefix/api/v1/nodes/disconnect/' + currentNet.value + '/' + node1Id + '/' + node2Id, {
        netname: currentNet.value,
        node1id: node1Id,
        node2id: node2Id
    }).then(function (response) {
        ElMessage.success("断开连接成功!");
        tableData.value.splice(0, tableData.value.length);
        getNetworksRequest();
    }).catch(function (error) {
        ElMessage.error("断开连接失败!" + error);
    })
}

//跳转
const jumpToConnectStateChart = () => {
    router.push('./nodesconnectstatechart');
}

//搜索
const handleSearch = () => {

}

// 多选
const handleSelectionChange = (val) => {
    multipleSelection.value = val;
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