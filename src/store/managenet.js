import { defineStore } from 'pinia'

export const useManageNetStore = defineStore('managenet', {
    state: () => {
        return {
            netName:''
        }
    },
    getters: {
        
    },
    actions: {
        setNetName(value) {
            this.netName = value;
        }
    }
})
