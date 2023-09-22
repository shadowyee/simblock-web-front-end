<!--创建网络->创建网络界面->管理节点-->
<!--管理网络->管理节点-->

<template>
    <div>
        <div class="container">
            显示图表、节点数据
        </div>
        <div class="container">
            <div class="handle-box">
                <span style="margin-right:10px">选择网络</span>
                <el-select v-model="currentNet" filterable :placeholder=managenetStore.netName @change="changeNet()">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button style="margin-left: 40px;" type="primary" key="primary" @click="jumpToConnectState()" link>
                    查看节点连接状态</el-button>
            </div>
            <el-table :data="tableData" border class="table" header-cell-class-name="table-header"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="nodeName" label="节点名称"></el-table-column>
                <el-table-column prop="nodeId" label="节点ID"></el-table-column>
                <el-table-column prop="nodePriKey" label="节点私钥" align="center"></el-table-column>
                <el-table-column label="节点状态" align="center">
                    <template #default="scope" :scope.row.state>
                        <el-tag :type="
                            scope.row.state === '已启动'
                                ? 'success'
                                : scope.row.state === '未启动'
                                    ? 'danger'
                                    : ''
                        ">{{ scope.row.state }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createDate" label="创建时间"></el-table-column>
                <el-table-column label="操作" width="300" align="center">
                    <template #default="scope">
                        <el-button type="primary" key="primary" @click="nodeDetailInfo(scope.$index)" link>详细信息
                        </el-button>
                        <el-popover placement="top">
                            <div style="text-align: center; margin: 0">
                                <el-button size="small" type="primary" @click="getNodesUpRequest(scope.$index)" link>
                                    节点启动</el-button><br>
                                <el-button size="small" type="primary" @click="getNodesDownRequest(scope.$index)" link>
                                    节点退出</el-button><br>
                            </div>
                            <template #reference>
                                <el-button type="primary" key="primary" link>操作</el-button>
                            </template>
                        </el-popover>
                        <el-popover placement="top">
                            <div style="text-align: center; margin: 0">
                                <el-button size="small" type="primary" @click="openMiningDialogForm(scope.$index)" link>
                                    开始出块</el-button><br>
                                <el-button size="small" type="primary" @click="getStopMiningRequest(scope.$index)" link>
                                    停止出块</el-button><br>
                            </div>
                            <template #reference>
                                <el-button type="primary" key="primary" link>出块</el-button>
                            </template>
                        </el-popover>
                    </template>
                </el-table-column>
            </el-table>
            <div class="button-box">
<!--                批量操作-->
                <el-button type="primary" @click="openMultiNodeDialogForm()" style="background: red">添加</el-button>
<!--                删除接口未实现-->
<!--                <el-button type="primary" @click="deleteSelectedNodes()" style="background: red">删除</el-button>-->
                <el-button type="primary" @click="getSelectedNodeUpRequest()" style="background: red">启动</el-button>
                <el-button type="primary" @click="getSelectedNodeDownRequest()" style="background: red">停止</el-button>
<!--                /批量操作-->
                <el-button type="primary" @click="openNodeDialogForm()">
                    <el-icon>
                        <Plus />
                    </el-icon> &nbsp添加节点
                </el-button>
                <el-button type="primary" @click="connectSelectedNodes()">建立连接</el-button>
                <el-button type="primary" @click="disconnectSelectedNodes()">断开连接</el-button>
            </div>
            <div>
                <el-dialog v-model="dialogNodeFormVisible" title="新增节点信息">
                    <el-form :model="newNodeData">
                        <el-form-item label="节点名称" :label-width="nodeFormLabelWidth">
                            <el-input v-model="newNodeData.nodeName" autocomplete="off" />
                        </el-form-item>
                        <el-form-item label="节点私钥" :label-width="nodeFormLabelWidth">
                            <el-input type="text" v-model="newNodeData.nodePriKey" autocomplete="off" maxlength="64"
                                show-word-limit clearable minlength="64" />
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button type="primary" key="primary" @click="randomHex()" link>随机生成64位密钥</el-button>
                            <el-button @click="closeNodeDialogForm">取消</el-button>
<!--                            <el-button type="primary" @click="closeNodeDialogForm(), postAddNodesRequest()">添加-->
                            <el-button type="primary" @click="postAddNodesRequest()">添加
                            </el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
<!--            批量添加节点弹窗-->
            <div>
                <el-dialog v-model="dialogMultiNodeFormVisible" title="批量添加节点">
                    <el-form :model="newMultiNodeData">
                        <el-form-item label="节点前缀名称" :label-width="multiNodeFormLabelWidth">
                            <el-input v-model="newMultiNodeData.nodePrefix" autocomplete="off" />
                        </el-form-item>
                        <el-form-item label="节点数量" :label-width="multiNodeFormLabelWidth">
                            <el-input type="number" v-model="newMultiNodeData.nodeCount"
                                      placeholder="请输入数字" min="1"
                                      oninput="this.value=this.value.replace(/\D/g); if(this.value.length > 3)this.value=this.value.slice(0, 3)"
                                      clearable
                            />
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="closeMultiNodeDialogForm">取消</el-button>
                            <el-button type="primary" @click="postAddMultiNodesRequest()">确定</el-button>
                        </span>
                    </template>
                </el-dialog>
            </div>
            <el-dialog v-model="dialogMiningFormVisible" title="出块账户信息">
                <el-form :model="newAccountData">
                    <el-form-item label="请输入账户地址" :label-width="miningFormLabelWidth">
                        <el-input v-model="newAccountData.accountAddr" autocomplete="off" />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="closeMiningDialogForm">取消</el-button>
                        <el-button type="primary" @click="closeMiningDialogForm(), getStartMiningRequest()">出块
                        </el-button>
                    </span>
                </template>
            </el-dialog>
            <!-- <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="nodesData.pageIndex"
                    :page-size="nodesData.pageSize" :total="pageTotal" @current-change="handlePageChange">
                </el-pagination>
            </div> -->
        </div>
        <el-dialog v-model="nodeMessageVisible" width="50%">
            <template #header="{ titleId, titleClass }">
                <div class="my-header">
                    <h4 :id="titleId" :class="titleClass">节点信息</h4>
                </div>
            </template>
            <json-viewer
                :value="nodeMessage"
                :expand-depth=5
                copyable
                boxed
                sort></json-viewer>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from "axios";
import { useManageNetStore } from '../store/managenet';
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useNetNodeStore } from '../store/netNode';
import JsonViewer from 'vue-json-viewer'

const netNodeStore = useNetNodeStore();             //网络节点store
const router = useRouter();
const managenetStore = useManageNetStore();
const tableData = ref([]);                           //表格信息
const currentNet = ref(managenetStore.netName);      //当前仿真网络
const nodesData = reactive({                         //表格页数(未使用)
    pageIndex: 1,
    pageSize: 10
});
const options = reactive([                          //下拉框选项
])
const multipleSelection = ref([]);                  //已选择的表格行对象(感觉有些地方可以用typescript限制一下输入类型)
const networksDataFromRequest = ref([]);            //保存请求结果response
// 多选
const handleSelectionChange = (val) => {
    multipleSelection.value = val;
}

// 节点详细信息
const nodeMessage = ref();
const nodeMessageVisible = ref(false);
const nodeDetailInfo = (index) => {
    axios.get('prefix/api/v1/nodes/' + managenetStore.netName + '/' + tableData.value[index].nodeId, {
        netname: managenetStore.netName,
        nodeid: tableData.value[index].nodeId
    }).then(function (response) {
        nodeMessageVisible.value = true
        // nodeMessage.value = response;
        nodeMessage.value = JSON.parse(JSON.stringify(response.data))
        console.log(response);
    }).catch(function (error) {
        ElMessage.error('获取节点信息失败!');
    })
}

// 更换网络
const changeNet = () => {
    var netLength = networksDataFromRequest.value.data.length;
    tableData.value.splice(0, tableData.value.length);
    for (var i = 0; i <= netLength - 1; i++) {
        if (networksDataFromRequest.value.data[i].name == currentNet.value) {
            var nodeLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
            for (var j = 0; j <= nodeLength - 1; j++) {
                tableData.value.push({
                    nodeName: networksDataFromRequest.value.data[i].nodes[j].info.name,
                    nodeId: networksDataFromRequest.value.data[i].nodes[j].info.id,
                    nodePriKey: networksDataFromRequest.value.data[i].nodes[j].config.private_key,
                    state: networksDataFromRequest.value.data[i].nodes[j].up == true ? "已启动" : "未启动",
                    createDate: "None"
                })
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
        netNodeStore.list = JSON.parse(JSON.stringify(response.data));          //将返回值存入netNodeStore,即存入pinia中
        //currentNet = managenetStore.netName;
        networksDataFromRequest.value = response;
        var netLength = response.data == null ? 0 : response.data.length;
        options.splice(0, options.length);
        for (var i = 0; i <= netLength - 1; i++) {
            options.push({
                label: response.data[i].name,
                value: response.data[i].name
            })
            if (response.data[i].name == currentNet.value) {
                var nodeLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
                for (var j = 0; j <= nodeLength - 1; j++) {
                    tableData.value.push({
                        nodeName: response.data[i].nodes[j].info.name,
                        nodeId: response.data[i].nodes[j].info.id,
                        nodePriKey: response.data[i].nodes[j].config.private_key,
                        state: response.data[i].nodes[j].up == true ? "已启动" : "未启动",
                        createDate: "None"
                    })
                }
            }
        }
        options.sort((x, y) => {
            return x.value > y.value;
        });

    }).catch(function (error) {
        ElMessage.error("获取信息失败，请检查网络设置");
        console.log(error);
    })
}

// 批量操作
// 1、批量添加节点
const multiNodeFormLabelWidth = '140px'
const newMultiNodeData = reactive({
    nodePrefix: '',
    nodeCount: 1,
})
const dialogMultiNodeFormVisible = ref(false)
const closeMultiNodeDialogForm = () => {
    dialogMultiNodeFormVisible.value = false;
}
const openMultiNodeDialogForm = () => {
    dialogMultiNodeFormVisible.value = true;
    newMultiNodeData.nodePrefix = '';
    newMultiNodeData.nodeCount = 1;
}

const postAddMultiNodesRequest = () => {
    // 表单有效性检查
    if (newMultiNodeData.nodePrefix === '') {
        ElMessage.error('未填写节点前缀名称');
        return;
    }

    // 批量请求创建节点
    var url = "/prefix/api/v1/nodes/" + currentNet.value;               //新建节点接口
    const requestList = ref([]);

    for(let i = 0; i < newMultiNodeData.nodeCount; i ++) {
        let data = {
            netname: managenetStore.netName,
            "private_key": getRandomHex(),
            name: newMultiNodeData.nodePrefix + "_" + i,
        }
        requestList.value.push(axios.post(url, data))
        console.log("axios post " + i);
    }
    Promise.all(requestList.value)
        .then(function (response) {
            // 所有创建节点请求都完成后才刷新页面
            tableData.value.splice(0, tableData.value.length);              //新建节点成功后清空表格中原有数据
            getNetworksRequest();                                           //新建节点成功后重新获取页面数据
            ElMessage.success("新建节点成功!");
        })
        .catch(function (error) {
            ElMessage.error("新建节点失败!");
        })

    closeMultiNodeDialogForm();
}


// 2、批量删除选中节点
const deleteNodeByNode = (node) => {
    axios.delete('/prefix/api/v1/nodes/' + managenetStore.netName + '/' + node.nodeId, {
        netname: managenetStore.netName,
        nodeid: node.nodeId
    }).then(function (response) {
        // node.state = "已启动";
        ElMessage.success('节点' + node.nodeName + '已删除!');
    }).catch(function (error) {
        ElMessage.error('节点' + node.nodeName + '删除失败!');
    })
}
const deleteSelectedNodes = () => {
    for (var i = 0; i <= multipleSelection.value.length - 1; i++) {
        deleteNodeByNode(multipleSelection.value[i]);
    }
    tableData.value.splice(0, tableData.value.length);              //新建节点成功后清空表格中原有数据
    getNetworksRequest();
}

// 3、批量启动选中节点
const getSelectedNodeUpRequest = () => {
    for (var i = 0; i < multipleSelection.value.length; i ++) {
        getNodesUpRequestByNode(multipleSelection.value[i]);
    }
}
// 4、批量停止选中节点
const getSelectedNodeDownRequest = () => {
    for (var i = 0; i < multipleSelection.value.length; i ++) {
        getNodesDownRequestByNode(multipleSelection.value[i]);
    }
}
// const getMultiNodesDownRequest = () => {
//     axios.get('/prefix/api/v1/nodes/down/' + managenetStore.netName + '/' + tableData.value[index].nodeId, {
//         netname: managenetStore.netName,
//         nodeid: tableData.value[index].nodeId
//     }).then(function (response) {
//         tableData.value[index].state = "未启动";
//         ElMessage.success('节点已停止!');
//         console.log(response);
//     }).catch(function (error) {
//         ElMessage.error('节点停止失败!');
//         console.log(error);
//     })
// }

// 新建节点
const nodeFormLabelWidth = '140px'
const newNodeData = reactive({
    nodeName: '',
    nodePriKey: '',
})
const dialogNodeFormVisible = ref(false)
const closeNodeDialogForm = () => {
    dialogNodeFormVisible.value = false;
}
const openNodeDialogForm = () => {
    dialogNodeFormVisible.value = true;
    newNodeData.nodeName = '';
    newNodeData.nodePriKey = '';
    randomHex();  // 默认填写随机私钥
}

const postAddNodesRequest = () => {
    // 表单有效性检查
    if (newNodeData.nodeName === '') {
        ElMessage.error('未填写节点名称');
        return;
    }
    if (newNodeData.nodePriKey === '') {
        ElMessage.error('未填写节点私钥');
        return;
    }

    var url = "/prefix/api/v1/nodes/" + currentNet.value;               //新建节点接口
    axios.post(url, {
        netname: managenetStore.netName,
        "private_key": newNodeData.nodePriKey,
        name: newNodeData.nodeName
    }).then(function (response) {
        tableData.value.splice(0, tableData.value.length);              //新建节点成功后清空表格中原有数据
        getNetworksRequest();                                           //新建节点成功后重新获取页面数据
        ElMessage.success("新建节点成功!");
    }).catch(function (error) {
        ElMessage.error("新建节点失败!");                                //弹出失败提示消息框，并打印错误信息
    })

    closeNodeDialogForm();
}

// 启动节点
const getNodesUpRequestByNode = (node) => {
    // ElMessage.info('/prefix/api/v1/nodes/up/' + managenetStore.netName + '/' + node.nodeId)  // 调试信息
    axios.get('/prefix/api/v1/nodes/up/' + managenetStore.netName + '/' + node.nodeId, {
        netname: managenetStore.netName,
        nodeid: node.nodeId
    }).then(function (response) {
        node.state = "已启动";
        ElMessage.success('节点' + node.nodeName + '已启动!');
    }).catch(function (error) {
        ElMessage.error('节点' + node.nodeName + '启动失败!\n' + error);
    })
}
const getNodesUpRequest = (index) => {
    getNodesUpRequestByNode(tableData.value[index]);
    // axios.get('/prefix/api/v1/nodes/up/' + managenetStore.netName + '/' + tableData.value[index].nodeId, {
    //     netname: managenetStore.netName,
    //     nodeid: tableData.value[index].nodeId
    // }).then(function (response) {
    //     tableData.value[index].state = "已启动";
    //     ElMessage.success('节点已启动!');
    // }).catch(function (error) {
    //     ElMessage.error('节点启动失败!');
    // })
}

// 停止节点
const getNodesDownRequestByNode = (node) => {
    ElMessage.info('/prefix/api/v1/nodes/down/' + managenetStore.netName + '/' + node.nodeId)
    axios.get('/prefix/api/v1/nodes/down/' + managenetStore.netName + '/' + node.nodeId, {
        netname: managenetStore.netName,
        nodeid: node.nodeId
    }).then(function (response) {
        node.state = "未启动";
        ElMessage.success('节点' + node.nodeName + '已停止!');
        console.log(response);
    }).catch(function (error) {
        ElMessage.error('节点' + node.nodeName + '停止失败!\n' + error);
        console.log(error);
    })
}
const getNodesDownRequest = (index) => {
    getNodesDownRequestByNode(tableData.value[index]);
    // axios.get('/prefix/api/v1/nodes/down/' + managenetStore.netName + '/' + tableData.value[index].nodeId, {
    //     netname: managenetStore.netName,
    //     nodeid: tableData.value[index].nodeId
    // }).then(function (response) {
    //     tableData.value[index].state = "未启动";
    //     ElMessage.success('节点已停止!');
    //     console.log(response);
    // }).catch(function (error) {
    //     ElMessage.error('节点停止失败!');
    //     console.log(error);
    // })
}

// 开始出块
const miningFormLabelWidth = '140px'
const newAccountData = reactive({
    accountAddr: '',
    formIndex: ''
})
const dialogMiningFormVisible = ref(false)
const closeMiningDialogForm = () => {
    dialogMiningFormVisible.value = false;
}
const openMiningDialogForm = (index) => {
    dialogMiningFormVisible.value = true;
    newAccountData.accountAddr = '';
    newAccountData.formIndex = index;
}

const getStartMiningRequest = () => {
    axios.get('/prefix/api/v1/nodes/startmining/' + managenetStore.netName + '/' + tableData.value[newAccountData.formIndex].nodeId + '?etherbase=' + newAccountData.accountAddr, {
        netname: managenetStore.netName,
        nodeid: tableData.value[newAccountData.formIndex].nodeId
    }).then(function (response) {
        ElMessage.success("出块成功!");
    }).catch(function (error) {
        ElMessage.error("出块失败!");
    })
}

// 停止出块
const getStopMiningRequest = (index) => {
    axios.get('/prefix/api/v1/nodes/stopmining/' + managenetStore.netName + '/' + tableData.value[index].nodeId, {
        netname: managenetStore.netName,
        nodeid: tableData.value[index].nodeId
    }).then(function (response) {
        ElMessage.success("出块已停止!");
    }).catch(function (error) {
        ElMessage.error("出块停止失败!");
    })
}

// 建立连接
const connectSelectedNodes = () => {
    for (var i = 0; i <= multipleSelection.value.length - 1; i++) {
        for (var j = i + 1; j <= multipleSelection.value.length - 1; j++) {
            getNodesConnectRequest(multipleSelection.value[i].nodeId, multipleSelection.value[j].nodeId);
        }
    }
}

const getNodesConnectRequest = (node1Id, node2Id) => {
    axios.get('/prefix/api/v1/nodes/connect/' + managenetStore.netName + '/' + node1Id + '/' + node2Id, {
        netname: managenetStore.netName,
        node1id: node1Id,
        node2id: node2Id
    }).then(function (response) {
        ElMessage.success("建立连接成功!");
        console.log(response);
    }).catch(function (error) {
        ElMessage.error("建立连接失败!" + error);
        console.log(error);
    })
}

// 断开连接
const disconnectSelectedNodes = () => {
    for (var i = 0; i <= multipleSelection.value.length - 1; i++) {
        for (var j = i + 1; j <= multipleSelection.value.length - 1; j++) {
            getNodesDisconnectRequest(multipleSelection.value[i].nodeId, multipleSelection.value[j].nodeId);
        }
    }
}

const getNodesDisconnectRequest = (node1Id, node2Id) => {
    axios.get('/prefix/api/v1/nodes/disconnect/' + managenetStore.netName + '/' + node1Id + '/' + node2Id, {
        netname: managenetStore.netName,
        node1id: node1Id,
        node2id: node2Id
    }).then(function (response) {
        ElMessage.success("断开连接成功!");
        console.log(response);
    }).catch(function (error) {
        ElMessage.error("断开连接失败!" + error);
        console.log(error);
    })
}

const print = () => {
    console.log(netNodeStore.list);
}

//跳转
const jumpToConnectState = () => {
    router.push('./nodesconnectstate');
}

//随机生成64位私钥
const randomHex = () => {
    newNodeData.nodePriKey = Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
    for (var i = 1; i <= 7; i++) {
        newNodeData.nodePriKey += Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
    }
}

const getRandomHex = () => {
    let value = "";
    value = Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
    for (var i = 1; i <= 7; i++) {
        value += Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
    }
    return value;
}
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.button-box {
    margin-top: 20px;
}
</style>