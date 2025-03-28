<template>
  <textarea
    id="taskInput"
    ref="textareaEl"
    class="autogrow-textarea"
    v-model="content"
    @keydown.ctrl.enter="handleSubmit"
    placeholder="Введите задачу (Ctrl+Enter для добавления)"
    rows="1"
  ></textarea>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useAutogrow } from '@/composables/useAutogrow'

const content = ref('')
const textareaEl = ref<HTMLTextAreaElement | null>(null)
const store = useTaskStore()

const { adjustHeight } = useAutogrow(textareaEl)

const handleSubmit = async () => {
  if (content.value.trim()) {
    await store.addTask(content.value)
    content.value = ''
    adjustHeight()
  }
}
</script>