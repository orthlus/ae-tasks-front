import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import ArchiveView from '@/views/ArchiveView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: MainView },
    { path: '/archive', component: ArchiveView }
  ]
})