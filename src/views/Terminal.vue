<template>
    <div>
        <link rel="stylesheet" href="node_modules\xterm\css\xterm.css" />
        <div id="xterm-container"></div>
    </div>
</template>

<script setup>
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit'
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
    ws.onmessage = (ev) => {
        console.log(ev.data)
    }
    return new Promise((resolve, reject) => {
        ws.onopen = () => {
            resolve(ws)
        }
        ws.onerror = (ev) => {
            reject("Terminal Connection WebSocket Error")
        }
    })
}

const initXterm = () => {
    // 创建terminal实例
    term.open(document.getElementById('xterm-container'))
    // 换行并输入起始符 $
    const terminalPrompt = "~/Simblock$";
    term.prompt = _ => {
        term.write("\r\n\x1b[33m" + terminalPrompt + "\x1b[0m ")
    }
    term.prompt()
    // canvas背景全屏
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    window.addEventListener("resize", resizeScreen)
    function resizeScreen() {
        try { // 窗口大小改变时，触发xterm的resize方法使自适应
            fitAddon.fit()
        } catch (e) {
            console.log("e", e.message)
        }
    }

    runFakeTerminal(terminalPrompt.length)
}

const runFakeTerminal = (promptLength) => {
    if (term._initialized) return
    // 初始化
    term._initialized = true
    term.writeln("Welcome to \x1b[1;31mSimblock Terminal\x1b[0m.")
    term.writeln("  ____    _   _     _   ____    _       ____    ____   _    _")
    term.writeln(" / ___|  | | |  \\  / | | __ )  | |     / __ \\  / ___| | | / /")
    term.writeln(" \\___ \\  | | | | \\/  | |  _ \\  | |    | |  | | | |    | |/ /")
    term.writeln("  ___) | | | | |\\  / | | |_) | | |__  | |__| | | |__  | |\\ \\")
    term.writeln(" |____/  |_| |_| \\/|_| |____/  |____|  \\____/  \\____| |_| \\_\\")

    term.prompt()

    let cmd = "";
    // 添加事件监听器，支持输入方法
    term.onKey(e => {
        const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
        if (e.domEvent.keyCode === 13) {       // 回车
            runCommand(cmd);
            cmd = "";
            // term.prompt();
        } else if (e.domEvent.keyCode === 8) { // 删除
            if (term._core.buffer.x > promptLength + 1) {
                term.write('\b \b');
                cmd = cmd.slice(0, cmd.length - 1);
                // console.log(cmd);
            }
        } else if (printable) {                // 输入一个字符
            term.write(e.key);
            // console.log(e.key);
            cmd += e.key;
        }
        // console.log(1, 'print', e.key)
    })
    term.onData(key => {  // 粘贴的情况
        if (key.length > 1) term.write(key);
    })
}

const runCommand = (cmd) => {
    if (cmd.length > 0) {
        axios.get('/prefix/' + cmd, {
        }).then(function (response) {
            console.log(response);
            term.write("\n" + response.data);
            term.prompt();
        }).catch(function (error) {
            console.log(error);
            term.prompt();
        })
    }
    else {
        term.prompt();
    }

}
</script>

<style></style>