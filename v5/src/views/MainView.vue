<template>
  <div class="main-page">
    <div class="input-header">
      <h3>Новая задача</h3>
      <button
        class="toggle-spoilers"
        @click="store.toggleAllSpoilers()"
      >
        {{ store.allSpoilersExpanded ? 'Свернуть все' : 'Развернуть все' }}
      </button>
    </div>

    <TaskInput @submit="handleSubmit" />

    <div class="tasks-list">
      <TaskItem
        v-for="task in store.tasks"
        :key="task.id"
        :task="task"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TaskInput from '@/components/TaskInput.vue'
import TaskItem from '@/components/TaskItem.vue'

const store = useTaskStore()

const handleSubmit = async (content: string) => {
  await store.addTask(content)
}

onMounted(() => {
  store.fetchTasks()
})
</script>