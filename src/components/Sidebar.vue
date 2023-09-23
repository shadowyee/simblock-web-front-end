<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="sidebar.collapse"
            background-color="#324157" text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-sub-menu :index="item.index" :key="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span>{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-sub-menu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template #title>{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                                    {{ threeItem.title }}</el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="subItem.index">{{ subItem.title }}
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <template #title>{{ item.title }}</template>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
import { computed } from "vue";
import { useSidebarStore } from '../store/sidebar'
import { useRoute } from "vue-router";
export default {
    setup() {
        const items = [
            {
                icon: "DataAnalysis",
                index: "/ethstats",
                title: "监控界面",
            },
            // {
            //     icon: "House",
            //     index: "/dashboard",
            //     title: "系统首页",
            // },
            {
                icon: "Odometer",
                index: "1",
                title: "仿真网络",
                subs: [
                    {
                        index: "/createnet",
                        title: "创建网络",
                    },
                    {
                        index: "/managenet",
                        title: "管理网络",
                    },

                ]
            },
            {
                icon: "House",
                index: "2",
                title: "交易测试",
                subs: [
                    {
                        index: "/transfer",
                        title: "转账管理"
                    },
                    {
                        index: "/info",
                        title: "交易信息",
                    },
                    {
                        index: "/contract",
                        title: "智能合约",
                    }
                ]
            },
            {
                icon: "Document",
                index: "/config",
                title: "配置信息"
            },
            {
                icon: "Edit",
                index: "/terminal",
                title: "命令行"
            }
        ];



        const route = useRoute();
        const onRoutes = computed(() => {
            return route.path;
        });

        const sidebar = useSidebarStore();

        return {
            items,
            onRoutes,
            sidebar,
        };
    },
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar>ul {
    height: 100%;
}
</style>
