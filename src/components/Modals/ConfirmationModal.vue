<template>
  <div class="confirmation-modal" v-if="visible">
    <div class="modal-content">
      <p>Вы уверены, что хотите удалить эту задачу?</p>
      <div class="modal-actions">
        <button class="modal-btn modal-cancel" @click="close">Отмена</button>
        <button class="modal-btn modal-confirm" @click="confirm">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits(['confirm', 'close'])

const confirm = () => emit('confirm')
const close = () => emit('close')
</script>