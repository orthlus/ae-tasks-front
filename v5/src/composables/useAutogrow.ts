import { onMounted, Ref } from 'vue'

export const useAutogrow = (textareaRef: Ref<HTMLTextAreaElement | null>) => {
  const adjustHeight = () => {
    if (!textareaRef.value) return
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }

  onMounted(() => {
    if (textareaRef.value) {
      textareaRef.value.addEventListener('input', adjustHeight)
      adjustHeight()
    }
  })

  return { adjustHeight }
}