// var Web3 = require('web3');

// var web3 = new Web3(new Web3.providers.HttpProvider('ws://127.0.0.1:8080/api/v1/nodes/rpc/net1/33bbd42c0031e10e0dba14b7ee8da06b70b33475aae2689b4d020538b557161a'));
// var source = "" +
//   "contract test {\n" +
//   "   function multiply(uint a) returns(uint d) {\n" +
//   "       return a * 7;\n" +
//   "   }\n" +
//   "}\n";
// web3.eth.compile.solidity(source)
//   .then(console.log);

import WebSocket from "ws";
const ws = new WebSocket(`ws://10.250.224.134:8080/api/v1/nodes/rpc/net1/33bbd42c0031e10e0dba14b7ee8da06b70b33475aae2689b4d020538b557161a`);
ws.onopen = function () {
  console.log('ws onopen');
  ws.send('{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":73}');
};
ws.onmessage = function (e) {
  // console.log('ws onmessage');
  const dataJson = eval("(" + e.data + ")");
  const data1 = parseInt(dataJson.result) / 1e9;
  const gas = data1.toFixed(2);
  console.log(gas);
};