// console.log("hello world");
// WebSocket = require('ws');
// var ws = new WebSocket('ws://localhost:8080/api/v1/nodes/rpc/net1/7f48138a84c742e4ac33063d0cd24b79cf6aba1d4ad053f78f7170ef2ede82b1');
// // ws.eth.account.create("11111111111111111111111111111111");
// ws.eth.accounts.create();
// ws.eth.getAccounts().then(console.log);
// console.log("End")

// WebSocket = require('ws');
// var ws = new WebSocket('ws://localhost:8080/api/v1/nodes/rpc/net1/7f48138a84c742e4ac33063d0cd24b79cf6aba1d4ad053f78f7170ef2ede82b1');
// ws.onopen = function () {
//     console.log('ws open');
//     ws.send( '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' );
// }
// ws.onmessage = function (e) {
//     console.log("ws onmessage");
//     console.log('from server:' + e.data);
// }

let Web3 = require('web3');
let web3;

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8080/api/v1/nodes/rpc/net6/5bae9dea956d878a52d8b2988c30114472c6a979950ac3f4cafab5d256239172"));
}
// let createaccounts = web3.eth.accounts.create();
// console.log(createaccounts);
web3.eth.getBalance("0xB0aD5c487a7F0AcB6538Fe99C12318EBECa493b3").then(console.log);
web3.eth.getAccounts().then(console.log);