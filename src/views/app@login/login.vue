<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { useAuthStore } from '@/utils/authStore';

const router = useRouter();
const authStore = useAuthStore();
const showPassword = ref(false);

const form = ref({
  email: '',
  password: ''
});

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
];

const onSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (valid) {
    const success = await authStore.login(form.value);
    if (success) {
      router.push('/dashboard');
    }
  }
};

const goToRegister = () => {
  router.push('/register');
};

const formRef = ref(null);
</script>

<template>
  <ABreadcrumb />

  <div class="flex h-auto p-6">
    <div class="w-full">
      <div class="flex items-center justify-center">
        <v-card class="bg-gray-800/90 rounded-lg shadow-box w-full max-w-md px-6 py-8">
          <div class="mb-6 text-center">
            <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-purple-300">Sign In</h2>
            <p class="mt-2 text-gray-400">Sign in to access your account</p>
          </div>

          <v-form ref="formRef" @submit.prevent="onSubmit">
            <v-card-text>
              <v-text-field
                  v-model="form.email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="emailRules"
                  density="comfortable"
                  bg-color="rgb(31, 41, 55)"
                  color="purple-accent-4"
                  class="mb-4"
              ></v-text-field>

              <v-text-field
                  v-model="form.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  :rules="passwordRules"
                  density="comfortable"
                  bg-color="rgb(31, 41, 55)"
                  color="purple-accent-4"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
              ></v-text-field>

              <div class="flex justify-end mb-4">
                <a href="#" class="text-sm text-purple-300 hover:text-purple-200">Forgot password?</a>
              </div>
            </v-card-text>

            <v-card-actions class="justify-center px-4 pb-4">
              <v-btn
                  type="submit"
                  block
                  color="purple-accent-2"
                  size="large"
                  :loading="authStore.loading"
                  class="text-white mb-3"
              >
                Sign In
              </v-btn>
            </v-card-actions>

            <div class="text-center mt-2 text-sm text-gray-400">
              Don't have an account?
              <a @click="goToRegister" class="ml-1 text-purple-300 hover:text-purple-200 cursor-pointer">Sign up</a>
            </div>
          </v-form>
        </v-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>