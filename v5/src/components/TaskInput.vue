<template>
  <textarea
    id="taskInput"
    class="autogrow-textarea"
    v-model="content"
    @keydown.ctrl.enter="handleSubmit"
    placeholder="Введите задачу (Ctrl+Enter для добавления)"
    rows="1"
  ></textarea>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const content = ref('')
const store = useTaskStore()

const adjustHeight = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const handleSubmit = async () => {
  if (content.value.trim()) {
    await store.addTask(content.value)
    content.value = ''
  }
}

onMounted(() => {
  const textarea = document.getElementById('taskInput') as HTMLTextAreaElement
  textarea.addEventListener('input', () => adjustHeight(textarea))
  adjustHeight(textarea)
})
</script>