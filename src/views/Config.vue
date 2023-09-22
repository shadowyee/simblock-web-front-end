<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 配置信息
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-descriptions class="margin-top" title="Genesis" :column="3" border>
                <template #extra>
                    <el-button type="primary">Modify</el-button>
                </template>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Difficulty
                        </div>
                    </template>
                    <div>{{ difficulty }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Gaslimit
                        </div>
                    </template>
                    <div>{{ gaslimit }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Nonce
                        </div>
                    </template>
                    <div>{{ nonce }}</div>
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="Miner" class="title-top" :column="3" border>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Gasceil
                        </div>
                    </template>
                    <div>{{ gasceil }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Gasprice
                        </div>
                    </template>
                    <div>{{ gasprice }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Recommit
                        </div>
                    </template>
                    <div>{{ recommit }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div class="cell-item">
                            Rpcgascap
                        </div>
                    </template>
                    <div>{{ rpcgascap }}</div>
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </div>
</template>
  
<script setup>
import { computed, ref, onMounted } from 'vue'
import axios from "axios";

const difficulty = ref('');
const gaslimit = ref('');
const nonce = ref('');
const gasceil = ref('');
const gasprice = ref('');
const recommit = ref('');
const rpcgascap = ref('');

onMounted(() => {
    getNetworksRequest();
})

const getNetworksRequest = () => {
    axios.get('/prefix/api/v1/config', {
    }).then(function (response) {
        difficulty.value = response.data.genesis.difficulty;
        gaslimit.value = response.data.genesis.gaslimit;
        nonce.value = response.data.genesis.nonce;
        gasceil.value = response.data.miner.gasceil;
        gasprice.value = response.data.miner.gasprice;
        recommit.value = response.data.miner.recommit;
        rpcgascap.value = response.data.miner.rpcgascap;
        console.log(response.data);
    }).catch(function (error) {
        console.log(error);
    })
}

</script>
  
<style scoped>
.el-descriptions {
    margin-top: 0px;
}

.cell-item {
    display: flex;
    align-items: center;
}

.margin-top {
    margin-top: 0px;
}

.title-top {
    margin-top: 20px;
}
</style>
  