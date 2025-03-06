<script setup lang="ts">
import { ref, watch } from 'vue';
import AProfileSettings from './a-profile-settings.vue';
import ANotificationSettings from './a-notification-settings.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialTab: {
    type: String,
    default: 'notifications',
    validator: (value) => ['notifications', 'profile'].includes(value)
  }
});

const emit = defineEmits(['close']);

const activeTab = ref(props.initialTab);

watch(() => props.initialTab, (newTab) => {
  activeTab.value = newTab;
});

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm"
        @click="closeModal"
    ></div>

    <div class="flex items-center justify-center min-h-screen p-4">
      <div
          class="relative w-full max-w-4xl gradient-background text-white rounded-xl shadow-lg overflow-hidden"
          @click.stop
      >
        <div class="border-b border-gray-700">
          <div class="flex items-center justify-between p-6">
            <h2 class="text-2xl font-bold">Settings</h2>
            <button
                @click="closeModal"
                class="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex space-x-6 px-6">
            <button
                @click="activeTab = 'profile'"
                :class="[
                'pb-4 px-2 font-medium transition-colors',
                activeTab === 'profile'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              ]"
            >
              Profile
            </button>
            <button
                @click="activeTab = 'notifications'"
                :class="[
                'pb-4 px-2 font-medium transition-colors',
                activeTab === 'notifications'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-300 hover:text-white'
              ]"
            >
              Notifications
            </button>
          </div>
        </div>

        <div class="p-6">
          <AProfileSettings v-if="activeTab === 'profile'" :is-open="isOpen && activeTab === 'profile'" />
          <ANotificationSettings v-if="activeTab === 'notifications'" :is-open="isOpen && activeTab === 'notifications'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-background {
  background-image: linear-gradient(to bottom right, rgba(30, 41, 59, 0.98), rgba(17, 24, 39, 0.98));
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
}
</style>