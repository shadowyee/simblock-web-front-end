import { defineStore } from 'pinia'

export const useCreateNetStore = defineStore('createnet', {
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
