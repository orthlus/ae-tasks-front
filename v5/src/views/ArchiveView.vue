<template>
  <div class="archive-page">
    <a href="#" class="nav-link" @click="goBack">← Назад к задачам</a>
    <button
      class="clear-archive-btn"
      @click="handleClearArchive"
      v-if="archivedTasks.length"
    >
      Удалить все задачи из архива
    </button>
    <div class="tasks-list">
      <TaskItem
        v-for="task in archivedTasks"
        :key="task.id"
        :task="task"
        is-archive
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useTaskStore()
const { archivedTasks } = storeToRefs(store)

const goBack = () => router.push('/')
const handleClearArchive = () => {
  // Логика очистки архива
}
</script>