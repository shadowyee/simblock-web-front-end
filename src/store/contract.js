import { defineStore } from "pinia";

export const useContractStore = defineStore('contracts', {
    state: () => {
        return {
            list: []
        }
    },
    getters: {
        
    },
    actions: {
        setContractItem(contractObj) {
            this.list.push(contractObj)
        }
    },
    persist: true
})