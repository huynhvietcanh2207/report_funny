import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ProjectDetail from '../views/ProjectDetail.vue'
import Users from '../views/Users.vue'
import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/users',
        name: 'Nhân viên',
        component: Users,
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Hồ sơ cá nhân',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/projects/:id',
        name: 'Chi tiết Dự án',
        component: ProjectDetail,
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/projects/:id/weeks/:weekId',
        name: 'Chi tiết Tuần',
        component: () => import('../views/WeekDetail.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/projects/:id/weeks/:weekId/report',
        name: 'Báo cáo Tuần Gộp',
        component: () => import('../views/WeeklyReport.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { requiresAuth: true }
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from) => {
    const token = localStorage.getItem('token')
    
    if (to.meta.requiresAuth && !token) {
        return { name: 'Login' }
    } else if (to.meta.guest && token) {
        return { name: 'Dashboard' }
    }
    // Return true to allow navigation if no conditions matched
    return true
})
