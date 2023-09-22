<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 添加节点
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column fixed prop="nodeName" label="节点名称" style="width: 33%">
          </el-table-column>
          <el-table-column prop="nodePriKey" label="节点私钥" style="width: 33%">
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template #default="scope">
              <el-tag :type="
                scope.row.nodeState === '已启动'
                  ? 'success'
                  : scope.row.nodeState === '未启动'
                    ? 'danger'
                    : ''
              ">{{ scope.row.nodeState }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 390px" @click="openDialogForm">添加新的节点</el-button>
        <el-button class="mt-4" style="width: 390px" @click="onJump">下一步</el-button>
      </div>
      <div>
        <el-dialog v-model="dialogFormVisible" title="新增节点信息">
          <el-form :model="newNodeData">
            <el-form-item label="节点名称" :label-width="formLabelWidth">
              <el-input v-model="newNodeData.nodeName" autocomplete="off" />
            </el-form-item>
            <el-form-item label="节点私钥" :label-width="formLabelWidth">
              <el-input type="text" v-model="newNodeData.nodePriKey" autocomplete="off" maxlength="64" show-word-limit
                clearable minlength="64" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" key="primary" @click="randomHex()" link>随机生成64位密钥</el-button>
              <el-button @click="closeDialogForm">取消</el-button>
              <el-button type="primary" @click="closeDialogForm(), postAddNodesRequest()">添加</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>

</template>

<script setup>
import { reactive, toRaw } from 'vue';
import { ref } from 'vue'
import { useRouter } from "vue-router";
import axios from 'axios';
import { useCreateNetStore } from '../store/createnet';   //已创建网络的信息
import { ElMessage } from 'element-plus'
import { useNetNodeStore } from '../store/netNode';

const netNodeStore = useNetNodeStore();             //网络节点store
const router = useRouter();
const createnetStore = useCreateNetStore();


//获取网络信息
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        netNodeStore.list = toRaw(response.data);          //将返回值存入netNodeStore,即存入pinia中
    }).catch(function (error) {
        console.log(error);
    })
}

//表格
const tableData = ref([

])

const onJump = () => {
  router.push('/nodesconnect');
}

const onAddNode = () => {
  tableData.value.push({
    nodeName: newNodeData.nodeName,
    nodePriKey: newNodeData.nodePriKey,
    nodeState: '未知状态'
  })
}

//对话框
const formLabelWidth = '140px'
const newNodeData = reactive({
  nodeName: '',
  nodePriKey: '',
})
const dialogFormVisible = ref(false)
const closeDialogForm = () => {
  dialogFormVisible.value = false;
}
const openDialogForm = () => {
  dialogFormVisible.value = true;
  newNodeData.nodeName = '';
  newNodeData.nodePriKey = '';
}


//发送新建节点请求
const postAddNodesRequest = () => {
  var url = "/prefix/api/v1/nodes/" + createnetStore.netName; //新建节点接口
  axios.post(url, {
    netname: createnetStore.netName,
    "private_key": newNodeData.nodePriKey,
    name: newNodeData.nodeName
  }).then(function (response) {
    success();                                      //弹出成功提示消息框
    onAddNode();                                    //在表格中添加节点
    getUpNodesRequest(response.data.info.id);      //在新建节点成功后就启动节点
    router.push('/addnodes');
  }).catch(function (error) {
    failed(error);                                  //弹出失败提示消息框，并打印错误信息
  })
}

//发送启动节点请求
const getUpNodesRequest = (nodeId) => {
  var url = "/prefix/api/v1/nodes/up/" + createnetStore.netName + "/" + nodeId; //启动节点接口
  axios.get(url, {
    netname: createnetStore.netName,
    nodeid: nodeId
  }).then(function (response) {
    getNetworksRequest();                           
    tableData.value[tableData.value.length - 1].nodeState = "已启动";
    console.log(response);
  }).catch(function (error) {
    getNetworksRequest();                           
    tableData.value[tableData.value.length - 1].nodeState = "未启动";
    console.log(error);
  })
}


//消息框
const success = () => {
  ElMessage({
    message: '新建节点成功！',
    type: 'success',
  })
}
const failed = (error) => {
  ElMessage.error('新建节点失败' + error);
}

//随机生成64位私钥
const randomHex = () => {
  newNodeData.nodePriKey = Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
  for (var i = 1; i<=7; i++){
    newNodeData.nodePriKey +=  Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
  }
}
</script>
