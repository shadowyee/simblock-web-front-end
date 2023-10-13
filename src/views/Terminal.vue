<template>
    <div>
        <link rel="stylesheet" href="node_modules\xterm\css\xterm.css" />
        <div id="xterm-container"></div>
    </div>
</template>

<script setup>
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit'
import { AttachAddon } from 'xterm-addon-attach'
import { ref, onMounted, reactive } from 'vue';
import axios from "axios";

const terminalRows = 40;
const terminalCols = 100;

const term = new Terminal({
    rendererType: "canvas", //渲染类型
    rows: terminalRows, //行数
    cols: terminalCols, // 不指定行数，自动回车后光标从下一行开始
    convertEol: true, //启用时，光标将设置为下一行的开头
    // scrollback: 50, //终端中的回滚量
    disableStdin: false, //是否应禁用输入
    // cursorStyle: "underline", //光标样式
    cursorBlink: true, //光标闪烁
    theme: {
        foreground: "#ECECEC", //字体
        background: "#000000", //背景色
        cursor: "help", //设置光标
        lineHeight: 20
    }
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
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()
    const attachAddon = new AttachAddon(ws)
    term.loadAddon(attachAddon)
}


</script>

<style></style>