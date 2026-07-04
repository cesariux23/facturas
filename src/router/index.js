import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CountView from '../views/CountView.vue'
import ExportView from '@/views/ExportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/conteo',
      name: 'conteo',
      component: CountView,
    },
    {
      path: '/export',
      name: 'export',
      component: ExportView,
    },
  ],
})

export default router
