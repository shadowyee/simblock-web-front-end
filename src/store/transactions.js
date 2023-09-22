import { defineStore } from "pinia";

export const useTransactionsStore = defineStore('transactions', {
    state: () => {
        return {
            list: []
        }
    },
    getters: {
        transNum: (state) => {
            return state.list.length;
        }
    },
    actions: {
        setTransItem(net, node, hash) {
            this.list.push({
                "net": net,
                "node": node,
                "transHash": hash,
            })
        },
        update(dataList) {
            this.list = dataList
        }
    },
    persist: true
})