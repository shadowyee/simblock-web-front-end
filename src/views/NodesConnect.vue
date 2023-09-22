<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 建立连接
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column fixed prop="nodeName" label="节点名称" style="width: 33%" />
        <el-table-column prop="nodePriKey" label="节点私钥" style="width: 33%" />
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
      <el-button class="mt-4" style="width: 195px" @click="nodesConnect()">建立连接</el-button>
      <el-button class="mt-4" style="width: 195px" @click="onJump">下一步</el-button>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { useCreateNetStore } from '../store/createnet';   //已创建网络的信息
import axios from 'axios';
import { ElMessage } from 'element-plus'
import { useNetNodeStore } from '../store/netNode';

const netNodeStore = useNetNodeStore();             //网络节点store
const router = useRouter()
const createnetStore = useCreateNetStore();
const multipleSelection = ref([]);                  //已选择的表格行对象


//获取网络信息
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        netNodeStore.list = JSON.parse(JSON.stringify(response.data));          //将返回值存入netNodeStore,即存入pinia中
        //console.log(netNodeStore.list);
        console.log(tableData);
    }).catch(function (error) {
        console.log(error);
    })
}

// 多选
const handleSelectionChange = (val) => {
  multipleSelection.value = val;
}

//查询网络节点情况
onMounted(() => {
  getQueryNodesOfNetRequest();
})

const getQueryNodesOfNetRequest = () => {
  var url = "/prefix/api/v1/networks";              //查询网络接口
  axios.get(url, {

  }).then(function (response) {
    console.log(response);
    var length = response.data.length;
    for (var i = 0; i <= length - 1; i++) {
      if (response.data[i].name == createnetStore.netName) {
        var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
        for (var j = 0; j <= nodesLength - 1; j++) {
          tableData.value.push({
            nodeId: response.data[i].nodes[j].info.id,
            nodeName: response.data[i].nodes[j].info.name,
            nodePriKey: response.data[i].nodes[j].config.private_key,
            nodeState: response.data[i].nodes[j].up == true ? "已启动" : "未启动"   //用三目运算符判断节点启动状态
          })
        }
      }
    }
  }).catch(function (error) {
    console.log(url);
    console.log(error);
  })
}

//表格
const tableData = ref([

])

const onJump = () => {
  router.push('/startmining');
}

//建立连接
const nodesConnect = () => {
  console.log(multipleSelection.value);
  for (var i = 0; i <= multipleSelection.value.length - 1; i++) {
    for (var j = i + 1; j <= multipleSelection.value.length - 1; j++) {
      getNodesConnectRequest(multipleSelection.value[i].nodeId, multipleSelection.value[j].nodeId);
    }
  }
  getNetworksRequest()
}

const getNodesConnectRequest = (node1Id, node2Id) => {
  var url = "/prefix/api/v1/nodes/connect/" + createnetStore.netName + "/" + node1Id + "/" + node2Id;              //查询网络接口
  axios.get(url, {
    netname: createnetStore.netName,
    node1id: node1Id,
    node2id: node2Id
  }).then(function (response) {
    console.log(url);
    success();
  }).catch(function (error) {
    console.log(url);
    console.log(error);
    failed();
  })
}


//消息框
const success = () => {
  ElMessage({
    message: '节点连接成功！',
    type: 'success',
  })
}
const failed = () => {
  ElMessage.error('节点连接失败')
}
</script>
