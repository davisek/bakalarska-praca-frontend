<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { useAuthStore } from '@/utils/authStore';
import AResetPassword from "@/views/app@login/a-reset-password.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const emailError = ref('');
const passwordError = ref('');
const formSubmitted = ref(false);

const isForgotPasswordModalOpen = ref(false);

const form = ref({
  email: '',
  password: ''
});

const validateEmail = () => {
  if (!form.value.email) {
    emailError.value = t('login.emailRequired');
    return false;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.value.email)) {
    emailError.value = t('login.emailValid');
    return false;
  }

  emailError.value = '';
  return true;
};

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = t('login.passwordRequired');
    return false;
  } else if (form.value.password.length < 8) {
    passwordError.value = t('login.passwordLength');
    return false;
  }

  passwordError.value = '';
  return true;
};

const onSubmit = async () => {
  formSubmitted.value = true;

  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (isEmailValid && isPasswordValid) {
    const result = await authStore.login(form.value);
    if (result === true) {
      router.push('/dashboard');
    } else if (result && result.errors) {
      if (result.errors.email) {
        emailError.value = result.errors.email[0];
      }
      if (result.errors.password) {
        passwordError.value = result.errors.password[0];
      }
    }
  }
};

const openForgotPasswordModal = () => {
  isForgotPasswordModalOpen.value = true;
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <ABreadcrumb />

  <div class="flex h-auto lg:p-6 p-0">
    <div class="w-full">
      <div class="flex items-center justify-center">
        <div class="bg-gray-800/90 rounded-lg shadow-box w-full max-w-md px-6 py-8">
          <div class="mb-6 text-center">
            <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-purple-300">{{ t('login.signIn') }}</h2>
            <p class="mt-2 text-gray-400">{{ t('login.signInDescription') }}</p>
          </div>

          <Form @submit.prevent="onSubmit">
            <div class="flex flex-col gap-1 mb-4">
              <InputText
                  v-model="form.email"
                  :invalid="!!emailError"
                  variant="outlined"
                  name="email"
                  type="email"
                  :placeholder="t('login.email')"
                  @blur="validateEmail"
              />
              <Message v-if="emailError" severity="error" size="small" variant="simple">{{ emailError }}</Message>
            </div>

            <div class="flex flex-col gap-1 mb-4">
                <Password
                    v-model="form.password"
                    :invalid="!!passwordError"
                    variant="outlined"
                    :feedback="false"
                    :toggleMask="true"
                    inputClass="w-full"
                    :placeholder="t('login.password')"
                    @blur="validatePassword"
                />
              <Message v-if="passwordError" severity="error" size="small" variant="simple">{{ passwordError }}</Message>
            </div>

            <div class="flex justify-end mb-4">
              <a @click="openForgotPasswordModal" class="text-sm text-purple-300 hover:text-purple-200">
                {{ t('login.forgotPassword') }}
              </a>
            </div>

            <div class="mb-4">
              <Button
                  type="submit"
                  :label="t('login.signIn')"
                  severity="help"
                  icon="pi pi-sign-in"
                  :loading="authStore.loading"
                  class="w-full"
              />
            </div>

            <div class="text-center mt-2 text-sm text-gray-400">
              {{ t('login.dontHaveAccount') }}
              <a @click="goToRegister" class="ml-1 text-purple-300 hover:text-purple-200 cursor-pointer">
                {{ t('login.signUp') }}
              </a>
            </div>
          </Form>
        </div>

        <Dialog
            v-model:visible="isForgotPasswordModalOpen"
            :header="t('login.resetPassword')"
            :modal="true"
            :closable="true"
            :closeOnEscape="true"
        >
          <AResetPassword @close="isForgotPasswordModalOpen = false"/>
        </Dialog>

      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  cursor: pointer;
}
</style>