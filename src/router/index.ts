import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import ArchiveView from '@/views/ArchiveView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MainView },
    { path: '/archive', component: ArchiveView }
  ]
})