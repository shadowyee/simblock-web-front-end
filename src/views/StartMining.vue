<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 开始出块
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column fixed prop="nodeName" label="节点名称" style="width: 20%" />
          <el-table-column prop="nodePriKey" label="节点私钥" style="width: 20%" />
          <el-table-column label="节点状态" align="center">
            <template #default="scope" :scope.row.nodeState>
              <el-tag :type="
                scope.row.nodeState === '已启动'
                  ? 'success'
                  : scope.row.nodeState === '未启动'
                    ? 'danger'
                    : ''
              ">{{ scope.row.nodeState }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" style="width: 20%">
            <template #default="scope">
              <el-button type="primary" size="small" @click.prevent="openDialogForm(scope.$index)">
                出块
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" style="width: 195px" @click="onJump">完成</el-button>
      </div>
      <div>
        <el-dialog v-model="dialogFormVisible" title="出块账户信息">
          <el-form :model="newAccountData">
            <el-form-item label="请输入账户地址" :label-width="formLabelWidth">
              <el-input v-model="newAccountData.accountAddr" autocomplete="off" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="closeDialogForm">取消</el-button>
              <el-button type="primary" @click="closeDialogForm(), startMining()">出块</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from "vue-router";
import { useCreateNetStore } from '../store/createnet';   //已创建网络的信息
import axios from 'axios';
import { ElMessage } from 'element-plus'


import { reactive } from 'vue';

const router = useRouter()
const createnetStore = useCreateNetStore();
const nodeIdArr = ref([

]);

//查询网络节点情况
onMounted(() => {
  getQueryNodesOfNetRequest();
})

const getQueryNodesOfNetRequest = () => {
  var url = "/prefix/api/v1/networks";              //查询网络接口
  axios.get(url, {

  }).then(function (response) {
    console.log(response);
    var length = response.data == null ? 0 : response.data.length;
    for (var i = 0; i <= length - 1; i++) {
      if (response.data[i].name == createnetStore.netName) {
        var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
        for (var j = 0; j <= nodesLength - 1; j++) {
          nodeIdArr.value.push({
            nodeId: response.data[i].nodes[j].info.id
          })
          tableData.value.push({
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

const deleteRow = (index) => {
  tableData.value.splice(index, 1)
}

const onAddItem = () => {
  tableData.value.push({

  })
}

const onJump = () => {
  router.push('/createnet');
}

//对话框
const formLabelWidth = '140px'
const newAccountData = reactive({
  accountAddr: '',
  formIndex: ''
})
const dialogFormVisible = ref(false)
const closeDialogForm = () => {
  dialogFormVisible.value = false;
}
const openDialogForm = (index) => {
  dialogFormVisible.value = true;
  newAccountData.accountAddr = '';
  newAccountData.formIndex = index;
}

//开始出块
const startMining = () => {
  //console.log(typeof newAccountData.accountAddr);
  if (newAccountData.accountAddr !== '') {
    getStartMiningRequest(nodeIdArr.value[newAccountData.formIndex].nodeId, newAccountData.accountAddr);
  }
  else {
    ElMessage.error('请输入账户地址!')
  }
}

const getStartMiningRequest = (nodeId, accountAddr) => {
  var url = "/prefix/api/v1/nodes/startmining/" + createnetStore.netName + "/" + nodeId + "?etherbase=" + accountAddr;              //开始出块接口，缺少账户coinbase，需要用到websocket
  axios.get(url, {
    netname: createnetStore.netName,
    nodeid: nodeId,
    coinbase: accountAddr
  }).then(function (response) {
    console.log(url);
    console.log("startmining");
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
    message: '开始出块！',
    type: 'success',
  })
}
const failed = () => {
  ElMessage.error('出块失败!')
}
</script>