<script setup lang="ts">
import {ref} from "vue";
import axiosInstance from '@/plugins/axios';
import { showSuccess, showError } from '@/utils/notificationUtil';

const emit = defineEmits(['close']);
const step = ref<number>(1);
const resetCode = ref('');
const resetPassword = ref('');
const resetPasswordConfirmation = ref('');
const resetEmail = ref('');
const isLoading = ref<boolean>(false);

const emailError = ref('');
const passwordError = ref('');
const passwordConfirmationError = ref('');
const codeError = ref('');
const submitEmail = async () => {
  const isEmailValid = validateEmail();

  if (isEmailValid) {
    isLoading.value = true;

    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email: resetEmail.value });
      if (response.type === 'success') {
        showSuccess(response.message);
        step.value = 2;
      } else {
        showError(response.message);
        resetEmail.value = '';
      }
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to send reset email");
    } finally {
      isLoading.value = false;
    }
  }
};

const submitReset = async () => {
  const isPasswordValid = validatePassword();
  const isPasswordConfirmationValid = validatePasswordConfirmation();
  const isCodeValid = validateCode();

  if (isPasswordValid && isPasswordConfirmationValid && isCodeValid) {
    isLoading.value = true;

    try {
      const response = await axiosInstance.post('/auth/forgot-password/reset', {
        email: resetEmail.value,
        password: resetPassword.value,
        password_confirmation: resetPasswordConfirmation.value,
        code: resetCode.value
      });

      if (response.type === 'success') {
        showSuccess(response.message);
        emit('close');
      } else {
        showError(response.message);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed reset password");

    } finally {
      isLoading.value = false;
    }
  }
};

const resendCode = async () => {
  isLoading.value = true;

  try {
    const response = await axiosInstance.post('/auth/forgot-password/resend', {email: resetEmail.value});
    showSuccess(response.message);
  } catch (error: any) {
    showError(error.response?.data?.message || "Failed to resend code");
  } finally {
    isLoading.value = false;
  }
}

const validateEmail = () => {
  if (!resetEmail.value) {
    emailError.value = 'Email is required';
    return false;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(resetEmail.value)) {
    emailError.value = 'Email must be valid';
    return false;
  }
  emailError.value = '';
  return true;
};

const validatePassword = () => {
  if (!resetPassword.value) {
    passwordError.value = 'Password is required';
    return false;
  } else if (resetPassword.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters';
    return false;
  }
  passwordError.value = '';
  return true;
};

const validatePasswordConfirmation = () => {
  if (!resetPasswordConfirmation.value) {
    passwordConfirmationError.value = 'Password confirmation is required';
    return false;
  } else if (resetPasswordConfirmation.value !== resetPassword.value) {
    passwordConfirmationError.value = 'Passwords must match';
    return false;
  }
  passwordConfirmationError.value = '';
  return true;
};

const validateCode = () => {
  if (!resetCode.value) {
    codeError.value = 'Code is required';
    return false;
  } else if (resetCode.value.length != 5) {
    codeError.value = 'The code must be exactly 5 digits';
    return false;
  }
  codeError.value = '';
  return true;
};

</script>

<template>
  <div class="p-4 max-w mx-auto">
    <div v-if="step === 1" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">

        <div class="flex flex-col gap-1">
          <label for="email" class="text-gray-300">Email</label>
        <InputText
            v-model="resetEmail"
            :invalid="!!emailError"
            variant="outlined"
            name="email"
            type="email"
            placeholder="Enter your email"
            class="w-full"
            @blur="validateEmail"
        />
        <Message v-if="emailError" severity="error" size="small" variant="simple">{{ emailError }}</Message>
        </div>

        <div class="flex flex-col gap-1">
          <Button
            label="Submit"
            @click="submitEmail"
            severity="help"
            class="w-full"
            :disabled="isLoading"
            icon="pi pi-wrench"
          />
        </div>

      </div>
    </div>

    <div v-else-if="step === 2" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">

        <div class="flex flex-col gap-1 mb-6">
          <label for="code" class="text-gray-300">Code</label>
          <InputText
              v-model="resetCode"
              :invalid="!!codeError"
              variant="outlined"
              placeholder="Enter 5-digit code"
              maxlength="5"
              class="w-full"
              @blur="validateCode"
          />
          <Message v-if="codeError" severity="error" size="small" variant="simple">{{ codeError }}</Message>
        </div>
        <div class="flex flex-col gap-1 mb-6">
          <label for="newPassword" class="text-gray-300">New Password</label>
          <Password
              v-model="resetPassword"
              :invalid="!!passwordError"
              variant="outlined"
              :toggleMask="true"
              class="w-full"
              @blur="validatePassword"
          />
          <Message v-if="passwordError" severity="error" size="small" variant="simple">{{ passwordError }}</Message>
        </div>
        <div class="flex flex-col gap-1">
          <label for="resetPasswordConfirmation" class="text-gray-300">Confirm New Password</label>
          <Password
              v-model="resetPasswordConfirmation"
              :invalid="!!passwordConfirmationError"
              variant="outlined"
              :feedback="false"
              :toggleMask="true"
              class="w-full"
              @blur="validatePasswordConfirmation"
          />
          <Message v-if="passwordConfirmationError" severity="error" size="small" variant="simple">{{ passwordConfirmationError }}</Message>
        </div>
        <div class="mt-8">
          <Button
              label="Reset Password"
              @click="submitReset"
              severity="help"
              class="w-full"
              :disabled="isLoading"
              icon="pi pi-sync"
          />
        </div>

        <div class="text-center mt-2 text-sm text-gray-400">
          <a @click="resendCode" class="ml-1 text-purple-300 hover:text-purple-200 cursor-pointer">Resend code</a>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>