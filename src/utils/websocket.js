export default function createWS(net, nodeHash) {
    var ws = new WebSocket(`ws://127.0.0.1:8080/api/v1/nodes/rpc/${net}/${nodeHash}`);
    return ws;
}

// let WebSocket = require('ws');
// ws = new WebSocket('ws://localhost:8080');
// console.log(ws);