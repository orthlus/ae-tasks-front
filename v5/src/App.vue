<template>
  <AppHeader />
  <RouterView />
  <ConfirmationModal
    :visible="!!store.taskToDelete"
    @confirm="handleConfirmDelete"
    @close="store.taskToDelete = null"
  />
  <PasswordModal
    v-if="showPasswordModal"
    @confirm="handlePasswordConfirm"
    @close="showPasswordModal = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import AppHeader from '@/components/AppHeader.vue'
import ConfirmationModal from '@/components/Modals/ConfirmationModal.vue'
import PasswordModal from '@/components/Modals/PasswordModal.vue'

const store = useTaskStore()
const showPasswordModal = ref(false)

const handleConfirmDelete = async () => {
  if (store.taskToDelete) {
    await store.deleteTask(store.taskToDelete.id, store.taskToDelete.isPermanent)
    store.taskToDelete = null
  }
}

const handlePasswordConfirm = (password: string) => {
  // Логика проверки пароля и очистки архива
  showPasswordModal.value = false
}
</script>

<style scoped>
/* Базовые стили уже в main.scss */
</style>