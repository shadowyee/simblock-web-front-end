<template>
  <div class="container">
    <div class="handle-box">
      <el-select v-model="currentNet" placeholder="选择网络" class="handle-select mr10" @change="changeNet()">
        <el-option v-for="net in nets" :key="net.value" :label="net.value" :value="net.value"></el-option>
      </el-select>
      <el-select v-model="currentNode" placeholder="选择节点" class="handle-select mr10" @change="changeNode()">
        <el-option v-for="node in nodes" :key="node.name" :label="node.name" :value="node.id"></el-option>
      </el-select>
      <el-button type="primary" @click="openAccountDialog()">添加账户</el-button>
    </div>
    <el-table :data="tableData" border class="table" header-cell-class-name="table-header">
      <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
      <el-table-column prop="addr" label="账户地址"></el-table-column>
      <el-table-column prop="balance" label="余额(ether)" width="200"></el-table-column>
      <el-table-column prop="net" label="所属网络"></el-table-column>
      <el-table-column prop="node" label="所属节点"></el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag v-if="isCoinbase(scope.row)" :type="'success'">出块中</el-tag>
          <el-tag v-else :type="'danger'">未出块</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template #default="scope">
          <el-button type="primary" @click="handleEdit(scope.$index)">
            <el-icon style="vertical-align: middle">
              <Switch />
            </el-icon>
            <span style="vertical-align:middle">转账</span>
          </el-button>
          <el-button type="primary" key="primary" @click="infoDialog(scope.$index)">详情</el-button>
          <el-button v-if="isCoinbase(scope.row)" type="danger" key="danger"
            @click="stopMiner(scope.$index, scope.row)">
            停止出块</el-button>
          <el-button v-else type="primary" key="primary" @click="setMiner(scope.$index, scope.row)">出块
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="添加账户" v-model="accountDialogVisble" width="30%">
      <el-form ref="accountFormRef" :model="accountForm" status-icon :rules="rules" label-width="120px">
        <el-form-item label="网络">
          <el-input v-model="currentNet" disabled type="fromAddr" />
        </el-form-item>
        <el-form-item label="节点">
          <el-input v-model="currentNode" disabled />
        </el-form-item>
        <el-form-item label="PrivateKey" prop="privateKey">
          <el-input type="text" v-model="accountForm.privateKey" minlength="64" maxlength="64" placeholder="请输入私钥"
            show-word-limit clearable />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="accountForm.password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" key="primary" @click="randomHex()" link>随机生成64位密钥</el-button>
          <el-button type="primary" @click="handleAdd()">添 加</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog title="转账" v-model="editVisible" width="30%">
      <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="120px">
        <el-form-item label="From" prop="from">
          <el-input v-model="ruleForm.from" disabled type="fromAddr" />
        </el-form-item>
        <el-form-item label="Target" prop="target">
          <el-input v-model="ruleForm.target" maxlength="42" type="target" />
        </el-form-item>
        <el-form-item label="Password" prop="pass">
          <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="Amount(ether)" prop="amount">
          <el-input v-model.number="ruleForm.amount" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm(ruleFormRef)">转 账</el-button>
          <el-button @click="resetForm(ruleFormRef)">取 消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <el-dialog v-model="accountInfoVisible" width="80%">
      <el-descriptions title="账户详情" direction="horizontal" column="1" border>
        <el-descriptions-item label="net">{{ accountInfo.net }}</el-descriptions-item>
        <el-descriptions-item label="node">{{ accountInfo.node }}</el-descriptions-item>
          <el-descriptions-item label="addr">
              {{ accountInfo.addr }}<span class="text-copy" @click.stop="copyText(accountInfo.addr)">复制</span>
          </el-descriptions-item>
        <el-descriptions-item label="private_key">{{ accountInfo.private_key }}</el-descriptions-item>
        <el-descriptions-item label="password">{{ accountInfo.password }}</el-descriptions-item>
        <el-descriptions-item label="balance">{{ accountInfo.balance }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { reactive, ref, onMounted } from "vue";
import { FormInstance, ElMessage } from "element-plus";
import { useAccountsStore } from "../store/accounts.js";
import WebSocket from 'web3/dist/web3.min.js';
import { useTransactionsStore } from "../store/transactions";
import { table } from "console";

// 调用状态
const accounts = useAccountsStore();
const transaction = useTransactionsStore();

// 建立web3协议
let web3;
const createWeb = () => {
  web3 = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value));
  console.log("websocket连接成功!");
}

// 表单数据
const tableData = ref([]) as any;

onMounted(() => {
  getNetworksRequest();

})

// 从后端获取网络与节点
const networksDataFromRequest = ref([]) as any;            // 保存请求结果response
const currentNet = ref([]) as any;                         // 当前网络
const nets = reactive([]) as any;                          // 所有网络
const currentNode = ref([]) as any;                        // 当前节点
const nodes = reactive([]) as any;                         // 当前网络下的所有节点
const currentNodeStatusInfo = reactive({}) as any;         // 当前网络下的所有节点状态信息 (id: {up: value}) 启动状态
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
           currentNodeStatusInfo[response.data[i].nodes[j].info.id] = {
              up: response.data[i].nodes[j].up
           };
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
  Object.keys(currentNodeStatusInfo).forEach(key => delete currentNodeStatusInfo[key]);
  for (var i = 0; i <= netLength - 1; i++) {
    if (networksDataFromRequest.value.data[i].name == currentNet.value) {
      //nodes = networksDataFromRequest.value.data[i].nodes;
      var nodesLength = networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length;
      for (var j = 0; j <= nodesLength - 1; j++) {                        // 遍历节点
        nodes.push({
          name: networksDataFromRequest.value.data[i].nodes[j].info.name,
          id: networksDataFromRequest.value.data[i].nodes[j].info.id
        })
          currentNodeStatusInfo[networksDataFromRequest.value.data[i].nodes[j].info.id] = {
              up: networksDataFromRequest.value.data[i].nodes[j].up
          };
      }
    }
  }
}
// 更换节点
const changeNode = () => {
  createWeb();                         // 每次更换节点都需要更新websocket连接
  updateAccountList();
  updateBalance();
}

// 更新账户列表
const updateAccountList = () => {
  const l = [] as any;
  const accountList = JSON.parse(JSON.stringify(accounts.list))
  for (let i = 0; i < accounts.list.length; i++) {
    if (accountList[i].node == currentNode.value) {
      l.push(accountList[i]);
    }
  }
  tableData.value = l
}

const accountDialogVisble = ref(false);
const accountForm = reactive({
  net: "",
  node: "",
  privateKey: "",
  password: ""
})

// 添加账户-默认填写私钥
const openAccountDialog = () => {
    accountDialogVisble.value = true;
    randomHex();
}

// 添加账户弹窗处理
const handleAdd = () => {
    // ElMessage.info("调试信息：进入添加账户处理函数" + currentNode.value)  // 调试信息
    // 1、当前节点不属于当前网络 2、当前节点未启动  3、其他（正常情况）
    if (!(currentNode.value in currentNodeStatusInfo)) {
        ElMessage.error("创建失败，已切换net，但未切换node（该node不属于当前net）");
    }
    else if (!currentNodeStatusInfo[currentNode.value].up) {
        ElMessage.error("创建失败，该节点未启动，请启动后再重试！");
    }
    else {
        web3.eth.personal.importRawKey(accountForm.privateKey, accountForm.password).then(function (value) {
            ElMessage.success("创建成功");
            accounts.setAccount(currentNet.value, currentNode.value, value, accountForm.privateKey, accountForm.password);
            console.log("地址：" + value)
            updateAccountList();
            accountDialogVisble.value = false;
        }).catch(function (error) {
            console.log(error)
            ElMessage.error("创建失败");
        })
    }
}

// 随机生成私钥
const randomHex = () => {
  accountForm.privateKey = Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
  for (var i = 1; i <= 7; i++) {
    accountForm.privateKey += Math.floor((Math.random() * 0xffffffff)).toString(16).padEnd(8, "0");
  }
}

// 查看账户细节信息
const accountInfoVisible = ref(false);
const accountInfo = ref({}) as any;
const infoDialog = (data) => {
  accountInfo.value = tableData.value[data];
  accountInfoVisible.value = true;
}

// 转账
const editVisible = ref(false);
const ruleForm = reactive({
  net: "",
  node: "",
  from: "",
  target: "",
  pass: '',
  amount: '',
})
const handleEdit = (index) => {
  ruleForm.from = tableData.value[index].addr;
  ruleForm.net = tableData.value[index].net;
  ruleForm.node = tableData.value[index].node;
  editVisible.value = true;
}

// 转账表单
const ruleFormRef = ref<FormInstance>()

const validateTargetAddr = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入目标地址"));
  } else {
    if (value.length < 42) {
      callback(new Error("请输入正确的目标地址"));
    } else {
      callback();
    }
  }
}

const validateAmount = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入转账金额'))
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error('请输入数字'))
    } else {
      callback()
    }
  }, 1000)
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

const rules = reactive({
  target: [{ validator: validateTargetAddr, trigger: 'blur' }],
  pass: [{ validator: validatePass, trigger: 'blur' }],
  amount: [{ validator: validateAmount, trigger: 'blur' }],
})


// 提交转账表单
const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;

    if (ruleForm?.amount) {
        const amount = ruleForm.amount * 1000000000000000000;

        // ElMessage.info("调试信息：" + ruleForm.target);  // 调试信息

        formEl.validate((valid) => {
            if (valid) {
                web3.eth.personal.sendTransaction({
                    from: ruleForm.from,
                    to: ruleForm.target,
                    value: amount,
                    // gas: 100000
                }, ruleForm.pass).then(function (value) {
                    ElMessage.info("转账金额" + value);
                    console.log(value);
                    transaction.setTransItem(currentNet.value, currentNode.value, value);
                    ElMessage.success("转账成功");
                    editVisible.value = false;
                }).catch(function (error) {
                    console.log(error)
                    ElMessage.error("转账失败\n" + error);
                })
            }
        })
    }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  editVisible.value = false;
}

// 设置出块节点
const setMiner = (index, row) => {
  const coinbase = tableData.value[index].addr;
  row.isChanging = true;
  var url = "/prefix/api/v1/nodes/startmining/" + currentNet.value + "/" + currentNode.value + "?etherbase=" + coinbase;
  axios.get(url, {
    params: {
      netname: currentNet.value,
      nodeid: currentNode.value,
      coinbase: coinbase
    }
  }).then(function (response) {
    console.log("startmining");
    ElMessage.success("开始出块");
  }).catch(function (error) {
    console.log(error);
    ElMessage.error("出块失败");
  })
}

// 停止出块
const stopMiner = (index, row) => {
  var url = "/prefix/api/v1/nodes/stopmining/" + currentNet.value + "/" + currentNode.value;
  row.isChanging = false
  axios.get(url, {
    params: {
      netname: currentNet.value,
      nodeid: currentNode.value
    }
  }).then(function (response) {
    ElMessage.success("停止");
  }).catch(function (error) {
    ElMessage.error("停止失败");
  })
}

// 轮询账户余额
const updateBalance = () => {
  getData();
  const pollingST = setTimeout(() => {
    clearTimeout(pollingST);
    updateBalance();
  }, 500);
}

// 轮询获取账户余额，保存账户余额是否发生的记录用于判断出块账户与表格更新
const getData = () => {
  tableData.value.forEach((item, index) => {
    web3.eth.getBalance(item.addr).then(function (value) {
      if (tableData.value[index].balance != web3.utils.fromWei(value, 'ether')) {
        tableData.value[index].balance = web3.utils.fromWei(value, 'ether');
      }
    }).catch(function (error) {
      tableData[index].balance = "-1";
      console.log(error)
    })
  })
}

const status = ref(false);
const isMining = () => {
  web3.eth.isMining().then(function (value) {
    status.value = value;
  }).catch(function (error) {
    console.log(error)
  })
}

const tmpCoinbase = ref('');
const isCoinbase = (row) => {
  web3.eth.getCoinbase().then(function (value) {
    tmpCoinbase.value = value;
  }).catch(function (error) {
    console.log(error)
  })
  isMining();
  if (status.value && row.addr === tmpCoinbase.value) {
    return true;
  } else {
    return false;
  }
}


// 详情-账户地址快捷复制
const copyText = (text) => {
    // ElMessage.info("进入copyText");  // 调试信息
    navigator.clipboard.writeText(text)
        .then(() => {
            ElMessage.success("复制成功！");
        })
        .catch( (error) => {
            ElMessage.error("复制失败！");
    })
}
</script>

<style scoped>
.table {
  width: 100%;
  font-size: 14px;
}


.handle-box {
  margin-bottom: 20px;
}

.mr10 {
  margin-right: 10px;
}

.handle-select {
  width: 120px;
}
.text-copy {
    display: inline-block;
    padding: 0px 3px;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    cursor: pointer;
    transform: scale(0.7);
}

.text-copy:hover {
    /*color: #444;*/
    background-color: #777777;
}
</style>
