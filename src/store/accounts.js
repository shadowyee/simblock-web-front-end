import { defineStore } from "pinia";
// import { registAccount } from "../api/eth.js";

export const useAccountsStore = defineStore("accounts", {
    state: () => {
        return {
            list: [
                // {
                //     "id": 1,
                //     "net": "net1",
                //     "node": "node1",
                //     "private_key": "1",
                //     "pwd": "1"
                // },
                // {
                //     "id": 2,
                //     "net": "net2",
                //     "node": "node2",
                //     "addr": "2"
                // }
            ]
        }
    },
    getters: {
        accountsNum : (state) => {
            return state.list.length;
        }
    },
    actions: {
        setAccount(net, node, addr, key, password) {
            this.list.push({
                "net": net,
                "node": node,
                "addr": addr,
                "private_key": key,
                "password": password,
                "isChanging": false
            })
        }
    },
    persist: true
});