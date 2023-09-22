<template>
    <div>
        <el-button @click="createCoinBase">
            新建账户
        </el-button>
    </div>
</template>

<script setup>
import Web3 from 'web3';
import { BlockHeader, Block } from 'web3-eth'

const createCoinBase = () =>{
    WebSocket = require('ws')
    var ws = new WebSocket('ws://127.0.0.1:8080/api/v1/nodes/rpc/net1/nodeId')
    ws.onopen = function(){
        ws.send('{"jsonrpc":"2.0","method":"eth_coinbase","params":[],"id":64}');
    };
    ws.onmessage = function (e) {
        console.log(e.data);
    };
}


</script>