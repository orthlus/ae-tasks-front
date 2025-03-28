<template>
  <div
    class="task"
    :class="{ active: isExpanded }"
    @click="toggleSpoiler"
  >
    <div class="task-number-wrapper">
      <div class="task-number">#{{ task.id }}</div>
      <button
        class="copy-btn"
        @click.stop="copyTask"
        :class="{ copied: isCopied }"
        title="Копировать задачу"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>

    <div class="task-content-wrapper">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-spoiler" :class="{ active: isExpanded || $store.allSpoilersExpanded }">
        <div class="task-content" v-html="processedDescription"></div>
      </div>
    </div>

    <button
      class="delete-btn"
      @click.stop="handleDelete"
      :data-id="task.id"
      :data-permanent="isArchive"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps<{
  task: Task
  isArchive?: boolean
}>()

const store = useTaskStore()
const isCopied = ref(false)
const isExpanded = ref(false)

const processedDescription = computed(() =>
  props.task.description.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )
)

const toggleSpoiler = () => {
  if (window.getSelection()?.toString()) return
  isExpanded.value = !isExpanded.value
}

const copyTask = async () => {
  const content = `${props.task.title}\n${props.task.description}`
  await navigator.clipboard.writeText(content)
  isCopied.value = true
  setTimeout(() => isCopied.value = false, 2000)
}

const handleDelete = () => {
  if (window.innerWidth <= 600) {
    store.taskToDelete = { id: props.task.id, isPermanent: !!props.isArchive }
  } else {
    store.deleteTask(props.task.id, props.isArchive)
  }
}
</script>