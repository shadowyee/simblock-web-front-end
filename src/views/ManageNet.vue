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
                <el-input v-model="searchByName" placeholder="网络名称" class="handle-input mr10"
                    @keyup.delete="handleSearch()">
                </el-input>
                <el-button type="primary" @click="handleSearch()">
                    <el-icon>
                        <Search />
                    </el-icon>&nbsp搜索
                </el-button>
            </div>
            <el-table :data="tableData" border class="table" header-cell-class-name="table-header">
                <el-table-column type="index" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="netName" label="网络名称"></el-table-column>
                <el-table-column prop="defaultService" label="默认服务"></el-table-column>
                <el-table-column prop="nodesAmount" label="节点数" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template #default="scope">
                        <el-tag :type="
                            scope.row.state === '成功'
                                ? 'success'
                                : scope.row.state === '失败'
                                    ? 'danger'
                                    : ''
                        ">{{ scope.row.state }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="createDate" label="创建时间"></el-table-column>
                <el-table-column label="操作" width="300" align="center">
                    <template #default="scope">
                        <el-button type="primary" key="primary" @click="onJump(scope.$index)" link>
                            管理节点
                        </el-button>
                        <el-button type="danger" key="danger" @click="deleteNet(scope.$index, scope.row)" link>删除网络
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="netsData.pageIndex"
                    :page-size="netsData.pageSize" :total="pageTotal" @current-change="handlePageChange">
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { fetchData } from "../api/index";
import axios from "axios";
import { useRouter } from "vue-router";
import { useManageNetStore } from '../store/managenet';
import { useNetNodeStore } from '../store/netNode';

const netNodeStore = useNetNodeStore();             //网络节点store
const managenetStore = useManageNetStore();
const router = useRouter()                          //路由
const netsData = reactive({                         //网络信息
    netName: "",
    defaultService: "",
    pageIndex: 1,
    pageSize: 10,
});
const tableData = ref([]);                          //表格信息
const pageTotal = ref(0);                           //页数
const searchByName = ref('');                       //按网络名称搜索，初始值为空
const networksDataFromRequest = ref([]);            //保存请求结果response

// 获取网络信息
onMounted(() => {
    getNetworksRequest();
})
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        networksDataFromRequest.value = response;
        var length = response.data.length;
        netNodeStore.list = JSON.parse(JSON.stringify(response.data));          //将返回值存入netNodeStore,即存入pinia中
        console.log(netNodeStore.list);
        for (var i = 0; i <= length - 1; i++) {
            tableData.value.push({
                netName: response.data[i].name,
                defaultService: response.data[i].default_service,
                nodesAmount: response.data[i].nodes == null ? 0 : response.data[i].nodes.length,
                state: "成功",
                createDate: "None"
            })
        }
        tableData.value.sort((x, y) => {
            return x.netName > y.netName;
        })
        console.log(tableData);
    }).catch(function (error) {
        console.log(error);
    })
}

// 获取表格数据(分页DEMO参考)
const getData = () => {
    fetchData(netsData).then((res) => {
        tableData.value = res.list;
        pageTotal.value = res.pageTotal || 50;
    });
};
//getData();

// 搜索操作
const handleSearch = () => {
    if (searchByName.value.length != 0) {
        tableData.value.splice(0, tableData.value.length);
        for (var i = 0; i <= networksDataFromRequest.value.data.length - 1; i++) {
            for (var j = 1; j <= networksDataFromRequest.value.data[i].name.length; j++) {
                if (networksDataFromRequest.value.data[i].name.substring(0, j) == searchByName.value) {
                    tableData.value.push({
                        netName: networksDataFromRequest.value.data[i].name,
                        defaultService: networksDataFromRequest.value.data[i].default_service,
                        nodesAmount: networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length,
                        state: "成功",
                        createDate: "None"
                    })
                }
            }

        }
    }
    else {
        tableData.value.splice(0, tableData.value.length);
        for (var i = 0; i <= networksDataFromRequest.value.data.length - 1; i++) {
            tableData.value.push({
                netName: networksDataFromRequest.value.data[i].name,
                defaultService: networksDataFromRequest.value.data[i].default_service,
                nodesAmount: networksDataFromRequest.value.data[i].nodes == null ? 0 : networksDataFromRequest.value.data[i].nodes.length,
                state: "成功",
                createDate: "None"
            })
        }
    }

};

// 分页导航
const handlePageChange = (val) => {
    netsData.pageIndex = val;
    getData();
};

// 删除操作
const deleteNet = (index) => {
    // 二次确认删除
    ElMessageBox.confirm("确定要删除吗？", "提示", {
        type: "warning",
    }).then(() => {
        ElMessage.success("删除成功");
        deleteNetRequest(tableData.value[index].netName);
        tableData.value.splice(index, 1);
    }).catch(() => {

    });
};

const deleteNetRequest = (netName) => {
    axios.delete('/prefix/api/v1/networks/' + netName, {
        netname: netName
    }).then(function (response) {

    }).catch(function (error) {
        ElMessage.error(error);
    });
}

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form = reactive({
    name: "",
    address: "",
});
let idx = -1;
const handleEdit = (index, row) => {
    idx = index;
    Object.keys(form).forEach((item) => {
        form[item] = row[item];
    });
    editVisible.value = true;
};
const saveEdit = () => {
    editVisible.value = false;
    ElMessage.success(`修改第 ${idx + 1} 行成功`);
    Object.keys(form).forEach((item) => {
        tableData.value[idx][item] = form[item];
    });
};

//路由跳转
const onJump = (index) => {
    managenetStore.setNetName(tableData.value[index].netName);
    router.push('/managenodes');
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
