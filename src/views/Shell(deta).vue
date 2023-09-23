<!-- <template>
    <div>
        <div class="container">
            <div class="handle-box">
                <el-select v-model="currentNet" placeholder="选择网络" class="handle-select mr10" @change="changeNet()">
                    <el-option v-for="net in nets" :key="net.value" :label="net.value" :value="net.value"></el-option>
                </el-select>
                <el-select v-model="currentNode" placeholder="选择节点" class="handle-select mr10" @change="changeNode()">
                    <el-option v-for="node in nodes" :key="node.name" :label="node.name" :value="node.id"></el-option>
                </el-select>
                <el-button type="primary" @click="ethAccounts()">test</el-button>
            </div>
        </div>
    </div>
    <div ref="terminal"></div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import { ElMessage } from 'element-plus'
import axios from 'axios'
//import WebSocket from 'web3/dist/web3.min.js';


import 'xterm/css/xterm.css'

const accessToken = ref('token');
const terminal = ref(null);                             // 输入的命令
const networksDataFromRequest = ref([]);            // 保存请求结果response
const currentNet = ref([]);                         // 当前网络
const nets = reactive([]);                          // 所有网络
const currentNode = ref([]);                        // 当前节点
const nodes = reactive([]);                         // 当前网络下的所有节点
const web3 = ref([]);
let term = ref(null);

onMounted(() => {
    getNetworksRequest();
    // initTerm();
})


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
            currentNet.value = nets[0].value;
            if (response.data[i].name == currentNet.value) {
                var nodesLength = response.data[i].nodes == null ? 0 : response.data[i].nodes.length;
                for (var j = 0; j <= nodesLength - 1; j++) {                                     // 遍历节点
                    nodes.push({
                        name: response.data[i].nodes[j].info.name,
                        id: response.data[i].nodes[j].info.id
                    })
                }
                currentNode.value = nodes[0].id;
            }
        }
        nets.sort((x, y) => {
            return x.value > y.value;
        });
        connectByWebSocket();
    }).catch(function (error) {
        console.log(error);
        ElMessage.error("获取信息失败，请检查网络设置");
    })
}

// 更换节点
const changeNode = () => {
    connectByWebSocket();                         // 每次更换节点都需要更新websocket连接
    //initTerm();
}

const connectByWebSocket = () => {
    if (typeof web3.value !== 'undefined') {
        // 这里用的webSocket是xterm4里集成的websocket
        web3.value = new WebSocket('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value, 'token');
        //web3.value = new WebSocket('ws://127.0.0.1:8080');
        console.log("websocket连接成功!");
    } else {
        // web3.value = new WebSocket(new WebSocket.providers.WebsocketProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value));
        // web3.value = new WebSocket('ws://127.0.0.1:8080/api/v1/nodes/rpc/' + currentNet.value + '/' + currentNode.value, 'token');
        web3.value = new WebSocket('ws://127.0.0.1:8080');
        console.log("websocket连接成功!");
    }
    initTerm();
}

// 建立websocket连接
const initTerm = () => {
    // 1.xterm终端初始化
    term.value = new Terminal(
        {
        rendererType: "canvas", //渲染类型
        rows: 40, //行数
        cols: 100, // 不指定行数，自动回车后光标从下一行开始
        convertEol: true, //启用时，光标将设置为下一行的开头
        // scrollback: 50, //终端中的回滚量
        disableStdin: false, //是否应禁用输入
        windowsMode: true, // 根据窗口换行
        cursorStyle: "underline", //光标样式
        cursorBlink: true, //光标闪烁
        theme: {
            foreground: "#ECECEC", //字体
            background: "#000000", //背景色
            cursor: "help", //设置光标
            lineHeight: 20,
        }
    }
    );
    // // 2.webSocket初始化

    // this.socket = new WebSocket(this.socketUri, this.accessToken);    // 带 token 发起连接
    // 3.websocket集成的插件,这里要注意,网上写了很多websocket相关代码.xterm4版本没必要.
    const attachAddon = new AttachAddon(web3.value);
    const fitAddon = new FitAddon() // 全屏插件
    term.value.loadAddon(attachAddon);
    term.value.loadAddon(fitAddon);
    term.value.open(terminal.value);
    fitAddon.fit();
    term.value.onData((val) => {
        //term.value.write(val);
        web3.value.send(val);
    })
    term.value.focus();
    term.value.onKey(e => {
        // back 删除的情况
        if (e.domEvent.keyCode === 8) {
            if (term.value._core.buffer.x > 2) {
                term.value.write(' ');
            }
        }
    })

    // term = term;
}
</script> -->