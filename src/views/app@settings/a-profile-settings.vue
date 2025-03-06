<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import ANotification from "@/components/a-notification.vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const loading = ref(true);
const savingProfile = ref(false);
const changingPassword = ref(false);

const user = ref({
  id: null,
  name: '',
  surname: '',
  email: '',
  email_verified_at: '',
  locale: {
    value: 'en',
    label: 'English',
    symbol: ''
  }
});

const profileForm = ref({
  name: '',
  surname: '',
  email: '',
  email_verified_at: '',
  locale: 'en',
});

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
});

const locales = [
  { title: 'English', value: 'en' },
  { title: 'Slovak', value: 'sk' }
];

const fetchUserProfile = async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get('/user');

    user.value = response;
    profileForm.value.name = user.value.name;
    profileForm.value.surname = user.value.surname;
    profileForm.value.email = user.value.email;
    profileForm.value.email_verified_at = user.value.email_verified_at;
    profileForm.value.locale = user.value.locale.value;

    loading.value = false;
  } catch (error) {
    showError('Failed to load user profile');
    loading.value = false;
  }
};

const saveProfileInfo = async () => {
  try {
    savingProfile.value = true;

    const formProfileData = {};

    if (profileForm.value.name) formProfileData.name = profileForm.value.name;
    if (profileForm.value.surname) formProfileData.surname = profileForm.value.surname;
    if (profileForm.value.email) formProfileData.email = profileForm.value.email;
    if (profileForm.value.locale) formProfileData.locale = profileForm.value.locale;

    const response = await axiosInstance.put('/user', formProfileData);
    showSuccess(response.message);

    await fetchUserProfile();
  } catch (error) {
      const firstError = Object.values(error.response.data.errors)[0];
      showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');
  } finally {
    savingProfile.value = false;
  }
};

const changePassword = async () => {
  try {
    if (!passwordForm.value.current_password) {
      showError('Current password is required');
      return;
    }

    if (!passwordForm.value.password) {
      showError('New password is required');
      return;
    }

    if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
      showError('Password confirmation does not match');
      return;
    }

    changingPassword.value = true;

    const formPasswordData = {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    };

    const response = await axiosInstance.put('/user/change-password', formPasswordData);
    showSuccess(response.message);

    passwordForm.value.current_password = '';
    passwordForm.value.password = '';
    passwordForm.value.password_confirmation = '';
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');
    }
  } finally {
    changingPassword.value = false;
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchUserProfile();
  }
});

onMounted(() => {
  if (props.isOpen) {
    fetchUserProfile();
  }
});
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>

    <div v-else>
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-purple-300 mb-2">Profile Information</h3>
        <p class="text-gray-300">Update your account information.</p>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">First Name</label>
            <input
                v-model="profileForm.name"
                type="text"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Last Name</label>
            <input
                v-model="profileForm.surname"
                type="text"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">Email Address</label>
          <input
              v-model="profileForm.email"
              type="email"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-300">Language</label>
          <select
              v-model="profileForm.locale"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option v-for="locale in locales" :key="locale.value" :value="locale.value">
              {{ locale.title }}
            </option>
          </select>
        </div>

        <div class="flex justify-end mt-6">
          <button
              @click="saveProfileInfo"
              :disabled="savingProfile"
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium transition-colors shadow-md disabled:opacity-50"
          >
            <span v-if="savingProfile">Saving...</span>
            <span v-else>Save Profile Changes</span>
          </button>
        </div>
      </div>

      <div class="pt-10 mt-8 border-t border-gray-700">
        <h3 class="text-xl font-semibold text-purple-300 mb-2">Change Password</h3>
        <p class="text-gray-300">Update your password to maintain security.</p>

        <div class="space-y-4 mt-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Current Password</label>
            <input
                v-model="passwordForm.current_password"
                type="password"
                class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">New Password</label>
              <input
                  v-model="passwordForm.password"
                  type="password"
                  :disabled="!passwordForm.current_password"
                  class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">Confirm New Password</label>
              <input
                  v-model="passwordForm.password_confirmation"
                  type="password"
                  :disabled="!passwordForm.current_password"
                  class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <button
                @click="changePassword"
                :disabled="changingPassword || !passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation"
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition-colors shadow-md disabled:opacity-50"
            >
              <span v-if="changingPassword">Changing Password...</span>
              <span v-else>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <ANotification position="top-right" />
  </div>
</template>