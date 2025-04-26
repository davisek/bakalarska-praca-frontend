<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';
import ANotification from "@/components/a-notification.vue";
import ALoadingScreen from "@/components/a-loading-screen.vue";
import {Enum, User} from "@/types";
import {formatDateTime} from "@/utils/dateUtil.ts";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const isLoading = ref(true);
const savingProfile = ref(false);
const changingPassword = ref(false);
const locales = ref<Enum>(null)
const isVerificationModalOpen = ref(false);
const verificationCode = ref('');
const sendingVerification = ref(false);
const resendingCode = ref(false);

const user = ref<User>(null);

const profileForm = ref({
  name: '',
  surname: '',
  email: '',
  email_verified_at: '',
  locale: '',
  dark_mode: false,
});

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
});

const fetchUserProfile = async () => {
  try {
    isLoading.value = true;
    const response = await axiosInstance.get('/user');

    user.value = response;
    profileForm.value.name = user.value.name;
    profileForm.value.surname = user.value.surname;
    profileForm.value.email = user.value.email;
    profileForm.value.email_verified_at = user.value.email_verified_at;
    profileForm.value.locale = user.value.locale.value;
    profileForm.value.dark_mode = user.value.dark_mode;

    isLoading.value = false;
  } catch (error) {
    showError(t('profile.loadError'));
    isLoading.value = false;
  }
};

const saveProfileInfo = async () => {
  try {
    savingProfile.value = true;

    const formProfileData = {};

    if (profileForm.value.name) formProfileData.name = profileForm.value.name;
    if (profileForm.value.surname) formProfileData.surname = profileForm.value.surname;
    if (profileForm.value.email) formProfileData.email = profileForm.value.email;
    formProfileData.locale = profileForm.value.locale;
    formProfileData.dark_mode = profileForm.value.dark_mode;

    const response = await axiosInstance.put('/user', formProfileData);
    showSuccess(response.message);

    await fetchUserProfile();
  } catch (error) {
    const firstError = Object.values(error.response.data.errors)[0];
    showError(Array.isArray(firstError) ? firstError[0] : t('profile.validationError'));
  } finally {
    savingProfile.value = false;
  }
};

const changePassword = async () => {
  try {
    if (!passwordForm.value.current_password) {
      showError(t('profile.currentPasswordRequired'));
      return;
    }

    if (!passwordForm.value.password) {
      showError(t('profile.newPasswordRequired'));
      return;
    }

    if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
      showError(t('profile.passwordMismatch'));
      return;
    }

    changingPassword.value = true;

    const formPasswordData = {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.password,
      password_confirmation: passwordForm.value.password_confirmation
    };

    const response = await axiosInstance.put('/user/change-password', formPasswordData);
    if (response.type === 'success') {
      showSuccess(response.message);
    } else {
      showError(response.message);
    }

    passwordForm.value.current_password = '';
    passwordForm.value.password = '';
    passwordForm.value.password_confirmation = '';
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      const firstError = Object.values(error.response.data.errors)[0];
      showError(Array.isArray(firstError) ? firstError[0] : t('profile.validationError'));
    }
  } finally {
    changingPassword.value = false;
  }
};

const getLocale = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get(`/auth/locale`);
    locales.value = response.locales;
  } catch (error) {
    showError(t('profile.unknownError'));
  } finally {
    isLoading.value = false;
  }
}

const openVerificationModal = () => {
  isVerificationModalOpen.value = true;
};

const closeVerificationModal = () => {
  isVerificationModalOpen.value = false;
  verificationCode.value = '';
};

const submitVerificationCode = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 5) {
    showError(t('profile.verificationCodeInvalid'));
    return;
  }

  try {
    sendingVerification.value = true;
    const response = await axiosInstance.post('/auth/verify-email', {
      verification_code: verificationCode.value
    });

    if (response.type === 'success') {
      showSuccess(response.message);
    } else {
      showError(response.message);
    }
    closeVerificationModal();
    await fetchUserProfile();
  } catch (error) {
    if (error.response && error.response.data) {
      const errorData = error.response.data;

      if (errorData.message) {
        showError(errorData.message);
      } else if (errorData.errors) {
        const errors = errorData.errors;

        const firstErrorField = Object.keys(errors)[0];
        const firstError = errors[firstErrorField];
        showError(Array.isArray(firstError) ? firstError[0] : t('profile.validationError'));
      } else {
        showError(t('profile.verificationFailed'));
      }
    } else {
      showError(t('profile.connectionError'));
    }
  } finally {
    sendingVerification.value = false;
  }
};

const resendVerificationCode = async () => {
  try {
    resendingCode.value = true;
    const response = await axiosInstance.post('/auth/resend-code');

    if (response.type === 'success') {
      showSuccess(response.message);
    } else {
      showError(response.message);
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      showError(error.response.data.message);
    } else {
      showError(t('profile.resendFailed'));
    }
  } finally {
    resendingCode.value = false;
  }
};


watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchUserProfile();
    getLocale();
  }
});

onMounted(() => {
  if (props.isOpen) {
    fetchUserProfile();
    getLocale();
  }
});
</script>

<template>
  <div>
    <ALoadingScreen :is-loading="isLoading" />

    <div>
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-purple-300 mb-2">{{ t('profile.title') }}</h3>
        <p class="text-gray-300">{{ t('profile.description') }}</p>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm text-gray-300">{{ t('profile.firstName') }}</label>
            <InputText
                v-model="profileForm.name"
                class="w-full"
                variant="outlined"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm text-gray-300">{{ t('profile.lastName') }}</label>
            <InputText
                v-model="profileForm.surname"
                class="w-full"
                variant="outlined"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm text-gray-300">{{ t('profile.emailAddress') }}</label>
          <InputText
              v-model="profileForm.email"
              type="email"
              class="w-full"
              variant="outlined"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3">
          <div class="space-y-2">
            <label class="font-medium text-gray-300">{{ t('profile.emailVerification') }}</label>
            <div v-if="profileForm.email_verified_at" class="flex items-center p-3 bg-green-900/20 rounded-md border border-green-600/30">
              <i class="pi pi-check-circle text-green-400 mr-2 text-xl"></i>
              <div>
                <div class="text-green-400 font-medium">{{ t('profile.verified') }}</div>
                <div class="text-xs text-green-300/70">{{ formatDateTime(profileForm.email_verified_at) }}</div>
              </div>
            </div>
            <div v-else class="flex items-center p-3 bg-yellow-900/20 rounded-md border border-yellow-600/30">
              <i class="pi pi-exclamation-triangle text-yellow-400 mr-2 text-xl"></i>
              <div class="text-yellow-400 font-medium">
                {{ t('profile.notVerified') }}
              </div>
            </div>
            <Button
                v-if="!profileForm.email_verified_at"
                :label="t('profile.verifyNow')"
                severity="warning"
                text
                size="small"
                @click="openVerificationModal"
            />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <Button
              @click="saveProfileInfo"
              :isLoading="savingProfile"
              :label="t('profile.saveChanges')"
              severity="help"
              icon="pi pi-user-edit"
              iconPos="right"
              class="px-6 py-2"
          />
        </div>
      </div>

      <div class="pt-10 mt-8 border-t border-gray-700">
        <h3 class="text-xl font-semibold text-purple-300 mb-2">{{ t('profile.passwordSection') }}</h3>
        <p class="text-gray-300">{{ t('profile.passwordDescription') }}</p>

        <div class="space-y-4 mt-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">{{ t('profile.currentPassword') }}</label>
            <Password
                v-model="passwordForm.current_password"
                class="w-full"
                inputClass="w-full"
                :feedback="false"
                :toggleMask="true"
                variant="outlined"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">{{ t('profile.newPassword') }}</label>
              <Password
                  v-model="passwordForm.password"
                  :disabled="!passwordForm.current_password"
                  class="w-full"
                  inputClass="w-full"
                  :toggleMask="true"
                  variant="outlined"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-300">{{ t('profile.confirmPassword') }}</label>
              <Password
                  v-model="passwordForm.password_confirmation"
                  :disabled="!passwordForm.current_password"
                  class="w-full"
                  inputClass="w-full"
                  :feedback="false"
                  :toggleMask="true"
                  variant="outlined"
              />
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <Button
                @click="changePassword"
                :disabled="changingPassword || !passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation"
                :isLoading="changingPassword"
                :label="t('profile.changePassword')"
                severity="secondary"
                icon="pi pi-check"
                iconPos="right"
                class="px-6 py-2"
            />
          </div>
        </div>
      </div>
    </div>
    <ANotification position="top-right" />

    <Dialog
        v-model:visible="isVerificationModalOpen"
        :header="t('profile.verifyEmail')"
        :modal="true"
        :closable="true"
        :closeOnEscape="true"
    >
      <div class="p-4">
        <p class="mb-4 text-gray-200">{{ t('profile.verificationCodePrompt') }}</p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">{{ t('profile.verificationCode') }}</label>
          <InputText
              v-model="verificationCode"
              class="w-full"
              maxlength="5"
              :placeholder="t('profile.verificationCodePlaceholder')"
          />
        </div>

        <div class="flex justify-between mt-6">
          <Button
              @click="resendVerificationCode"
              :loading="resendingCode"
              :label="t('profile.resendCode')"
              severity="secondary"
              text
              icon="pi pi-refresh"
          />

          <Button
              @click="submitVerificationCode"
              :loading="sendingVerification"
              :label="t('profile.verify')"
              severity="success"
              icon="pi pi-check"
          />
        </div>
      </div>
    </Dialog>

  </div>
</template>

<style scoped>
</style>