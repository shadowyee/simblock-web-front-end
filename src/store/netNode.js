import { defineStore } from 'pinia';

export const useNetNodeStore = defineStore('netNode', {
    state: () => {
        return {
            list: [
                // {   
                //     "id": 1,
                //     "value": 'Net1',
                //     "label": 'net1',
                //     "children": [
                //         {
                //             "id": 1,
                //             "value": 'Node1',
                //             "label": 'node1',
                //             "addr": '969b0a11b8a56bacf1ac18f219e7e376e7c213b7e7e7e46cc70a5dd086daff2a',
                //             "private_key": '',
                //             "run": true
                //         },
                //         {
                //             "id": 2,
                //             "value": 'Node2',
                //             "label": 'node2',
                //             "addr": ''
                //         }
                //     ]
                // },
                // {
                //     "id": 2,
                //     "value": 'Net2',
                //     "label": 'net2',
                //     "children": [
                //         {
                //             "id": 3,
                //             "value": 'Node3',
                //             "label": 'node3',
                //             "addr": ''
                //         }
                //     ]
                // }
            ]
        }
    },
    
    getters: {
        netNum: (state) => {
            return state.list.length;
        },
        nodeNum: (state) => {
            let num = 0;
            state.list.forEach(net => {
                num += net.nodes.length;
            });
            return num;
        }
    },
    actions: {
        isNetExist(netName) {
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].name == netName) {
                    return true;
                }
            }
            return false;
        },
        isNodeExist(nodeName) {
            for (let i = 0; i < this.list.length; i++) {
                for (let j = 0; j < this.list[i].nodes.length; j++) {
                    if (this.list[i].nodes[j].info.name == nodeName) {
                        return true;
                    }
                }
            }
            return false;
        },
        getNetByName(name) {
            return this.list.find(net => net.name === name);
        },
        getNetByNode(node) {
            return this.list.find(net => net.nodes.find(n => n.config.name === node));
        },
        getNodeByName(name) {
            const net = this.list.find(net => net.nodes.find(node => node.config.name === name));
            console.log("net:")
            console.log(net)
            return net.nodes.find(node => node.config.name === name);
        },
        getNodeIdByName(name) {
            const node = this.getNodeByName(name);
            return node.config.id;
        }
    },
    persist: true
})