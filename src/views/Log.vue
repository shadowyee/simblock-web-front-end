<template>
    <div>
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="level" label="Level" width="70" />
            <el-table-column prop="ts" label="Time" width="180" />
            <el-table-column prop="caller" label="Caller" width="240" />
            <el-table-column prop="msg" label="Message" />
        </el-table>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
type LogType = {
    level: string;
    ts: string;
    caller: string;
    msg: string;
}
const tableData = ref<Array<LogType>>([]);
let ws;
onMounted(async () => {
    ws = await initWS()
    if (!(ws instanceof WebSocket)) return
    const keys = ["level", "ts", "caller"];
    ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data)
        const tableProperties = {};
        const otherProperties = {};
        Object.entries(data).forEach(([k, v]) => {
            if (keys.includes(k)) {
                tableProperties[k] = v;
            } else {
                otherProperties[k] = v;
            }
        })
        tableProperties["msg"] = JSON.stringify(otherProperties)
        tableData.value.push(tableProperties);
    }
})

const initWS = async (): Promise<WebSocket | Error> => {
    const ws = new WebSocket(`ws://${location.hostname}:8080/api/v1/logviewer`)
    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            resolve(ws)
        }
        ws.onerror = () => {
            reject(new Error("Terminal Connection WebSocket Error"))
        }
    })
}
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
</style>