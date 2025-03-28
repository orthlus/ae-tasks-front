<template>
  <div class="password-modal">
    <div class="password-modal-content">
      <h3>Подтвердите удаление</h3>
      <p>Введите пароль для удаления всех задач из архива:</p>
      <input
        type="password"
        class="password-input"
        v-model="password"
        @keyup.enter="handleConfirm"
        placeholder="Пароль"
      >
      <div class="password-modal-buttons">
        <button class="password-modal-btn" @click="emit('close')">Отмена</button>
        <button
          class="password-modal-btn password-modal-confirm"
          @click="handleConfirm"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
const emit = defineEmits(['confirm', 'close'])

const handleConfirm = () => {
  if (password.value.trim()) {
    emit('confirm', password.value)
    password.value = ''
  }
}
</script>

<style scoped>
/* Стили из оригинального CSS */
.password-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.password-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.password-input {
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  box-sizing: border-box;
}

.password-modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.password-modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.password-modal-confirm {
  background-color: var(--danger);
  color: white;
}
</style>