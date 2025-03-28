<template>
  <div class="header">
    <span class="username" @click="toggleDropdown">Профиль</span>
    <button
      class="logout-btn"
      :class="{ visible: showDropdown }"
      @click="handleLogout"
    >
      Выйти
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  // Логика выхода
}
</script>