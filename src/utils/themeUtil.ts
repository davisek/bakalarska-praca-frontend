import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(true)

  const updateThemeState = () => {
    isDarkMode.value = !document.documentElement.classList.contains('light-theme')
  }

  let observer: MutationObserver | null = null

  onMounted(() => {
    updateThemeState()

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeState()
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return isDarkMode
}