import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
    {
        path: '/',
        redirect: '/ethstats'
    }, {
        path: "/",
        name: "Home",
        component: Home,
        children: [
            {
                path: "/ethstats",
                name: "ethstats",
                meta: {
                    title: '网络监控'
                },
                component: () => import( /* webpackChunkName: "dashboard" */ "../views/EthStats.vue")
            },
            // {
            // path: "/dashboard",
            // name: "dashboard",
            // meta: {
            //     title: '系统首页'
            // },
            // component: () => import( /* webpackChunkName: "dashboard" */ "../views/Dashboard.vue")
            // }, 
            {
                path: '/tabs',
                name: 'tabs',
                meta: {
                    title: '标签'
                },
                component: () => import(/* webpackChunkName: "404" */ '../views/Tabs.vue')
            }, {
                path: '/404',
                name: '404',
                meta: {
                    title: '找不到页面'
                },
                component: () => import(/* webpackChunkName: "404" */ '../views/404.vue')
            }, {
                path: '/403',
                name: '403',
                meta: {
                    title: '没有权限'
                },
                component: () => import(/* webpackChunkName: "403" */ '../views/403.vue')
            }, {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import(/* webpackChunkName: "user" */ '../views/User.vue')
            }, {
                path: '/createnet',
                name: 'createnet',
                meta: {
                    title: '创建网络'
                },
                component: () => import('../views/CreateNet.vue'),
            }, {
                path: '/managenet',
                name: 'managenet',
                meta: {
                    title: '管理网络'
                },
                component: () => import('../views/ManageNet.vue')
            }, {
                path: '/addnodes',
                name: 'addnodes',
                meta: {
                    title: '添加节点'
                },
                component: () => import('../views/AddNodes.vue')
            }, {
                path: '/nodesconnect',
                name: 'nodesconnect',
                meta: {
                    title: '建立连接'
                },
                component: () => import('../views/NodesConnect.vue')
            }, {
                path: '/startmining',
                name: 'startmining',
                meta: {
                    title: '开始出块'
                },
                component: () => import('../views/StartMining.vue')
            }, {
                path: "/managenodes",
                name: "managenodes",
                meta: {
                    title: '管理节点'
                },
                component: () => import("../views/ManageNodes.vue")
            }, {
                path: "/nodesconnectstate",
                name: "nodesconnectstate",
                meta: {
                    title: '连接状态'
                },
                component: () => import("../views/NodesConnectState.vue")
            }, {
                path: "/nodesconnectstatechart",
                name: "nodesconnectstatechart",
                meta: {
                    title: '连接图表'
                },
                component: () => import("../views/NodesConnectStateChart.vue")
            }, {
                path: "/terminal",
                name: "terminal",
                meta: {
                    title: '命令行'
                },
                component: () => import("../views/Terminal.vue")
            },  {
                path: "/info",
                name: "transaction_information",
                meta: {
                    title: '交易信息'
                },
                component: () => import( /* webpackChunkName: "info" */ "../views/TransactionInfo.vue")
            }, {
                path: "/config",
                name: "Config",
                meta: {
                    title: '配置信息'
                },
                component: () => import( "../views/Config.vue")
            }, {
                path: "/transfer",
                name: "transfer",
                meta: {
                    title: '转账管理'
                },
                component: () => import( /* webpackChunkName: "transfer" */ "../views/TransferManage.vue")
            }, {
                path: "/contract",
                name: "contract",
                meta: {
                    title: '智能合约'
                },
                component: () => import( /* webpackChunkName: "create" */ "../views/Contract.vue")
            }, {
                path: "/login",
                name: "Login",
                meta: {
                    title: '登录'
                },
                component: () => import( /* webpackChunkName: "login" */ "../views/Login.vue")
            }, {
                path: "/log",
                name: "log",
                meta: {
                    title: '日志'
                },
                component: () => import("../views/Log.vue")
            }
        ]
    }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | vue-manage-system`;
    const role = localStorage.getItem('ms_username');
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permission) {
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        role === 'admin'
            ? next()
            : next('/403');
    } else {
        next();
    }
});

export default router;
