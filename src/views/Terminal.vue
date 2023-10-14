<template>
    <div>
        <link rel="stylesheet" href="../../node_modules/xterm/css/xterm.css" />
        <div id="xterm-container"></div>
    </div>
</template>

<script setup>
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import { ref, onMounted, reactive } from 'vue';

const term = new Terminal({
    rows: 40,
    cols: 160,
})

let ws = null;

onMounted(async () => {
    ws = await initTerminalWebSocket()
    if (!ws instanceof WebSocket) return
    initXterm();
})

const initTerminalWebSocket = async () => {
    const ws = new WebSocket(`ws://${location.hostname}:8080/api/v1/terminal/ws`)
    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            resolve(ws)
        }
        ws.onerror = () => {
            reject("Terminal Connection WebSocket Error")
        }
    })
}

const initXterm = () => {
    // 创建terminal实例
    term.open(document.getElementById('xterm-container'))
    const attachAddon = new AttachAddon(ws)
    term.loadAddon(attachAddon)
}


</script>