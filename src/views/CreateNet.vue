<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <i class="el-icon-lx-cascades"></i> 创建网络
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-form :model="form" label-width="120px">
        <el-form-item label="输入网络名称">
          <el-input v-model="form.netname"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="postCreateNetRequest">创建</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRaw } from 'vue'
import axios from 'axios';
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus'
import { useCreateNetStore } from '../store/createnet';
import { useNetNodeStore } from '../store/netNode';
import { useManageNetStore } from '../store/managenet';

const managenetStore = useManageNetStore();
const netNodeStore = useNetNodeStore();             //网络节点store
const store = useCreateNetStore();
const router = useRouter();
const form = reactive({
  netname: ''
})



//发送创建仿真网络请求
const postCreateNetRequest = () => {
  axios.post("/prefix/api/v1/networks", {
    name: form.netname
  }).then(function (response) {
    success();
    store.setNetName(form.netname);
    getNetworksRequest();                           //将更新后的数据存入pinia
    // router.push('/addnodes');
    managenetStore.setNetName(form.netname);
    router.push('/managenodes');
  }).catch(function (error) {
    failed();
    console.log(error);
  })
}

//获取网络信息
const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/networks', {
    }).then(function (response) {
        netNodeStore.list = toRaw(response.data);          //将返回值存入netNodeStore,即存入pinia中
        console.log(netNodeStore.list);
        // console.log(netNodeStore.list[0].nodes[0].config.name);
        
    }).catch(function (error) {
        console.log(error);
    })
}


//消息框
const success = () => {
  ElMessage({
    message: '仿真网络创建成功！',
    type: 'success',
  })
}
const failed = () => {
  ElMessage.error('仿真网络创建失败，请更换网络名称后再次尝试')
}
</script>
