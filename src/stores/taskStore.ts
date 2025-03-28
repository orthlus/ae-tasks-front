import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Task {
  id: number
  title: string
  description: string
}

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const archivedTasks = ref<Task[]>([])
  const allSpoilersExpanded = ref(false)
  const taskToDelete = ref<{id: number; isPermanent: boolean} | null>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/tasks`)
      tasks.value = data.sort((a: Task, b: Task) => b.id - a.id).map(parseTask)
    } catch (error) {
      console.error('Ошибка загрузки задач:', error)
    }
  }

  const fetchArchived = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/archive`)
      archivedTasks.value = data.sort((a: Task, b: Task) => b.id - a.id).map(parseTask)
    } catch (error) {
      console.error('Ошибка загрузки архива:', error)
    }
  }

  const parseTask = (task: any): Task => {
    const [title, ...description] = task.content.split('\n')
    return {
      id: task.id,
      title: title.trim(),
      description: description.join('\n').trim()
    }
  }

  const addTask = async (content: string) => {
    try {
      const { data } = await axios.post(`${API_BASE}/tasks`, { content })
      tasks.value.unshift(parseTask({ id: data.id, content }))
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      throw error
    }
  }

  const deleteTask = async (id: number, isPermanent = false) => {
    try {
      await axios.delete(`${API_BASE}/${isPermanent ? 'archive' : 'tasks'}/${id}`)
      if (isPermanent) {
        archivedTasks.value = archivedTasks.value.filter(t => t.id !== id)
      } else {
        tasks.value = tasks.value.filter(t => t.id !== id)
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  const toggleAllSpoilers = () => {
    allSpoilersExpanded.value = !allSpoilersExpanded.value
  }

  return {
    tasks,
    archivedTasks,
    allSpoilersExpanded,
    taskToDelete,
    fetchTasks,
    fetchArchived,
    addTask,
    deleteTask,
    toggleAllSpoilers
  }
})