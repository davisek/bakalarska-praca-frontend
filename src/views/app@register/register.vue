<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/plugins/axios';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { showSuccess, showError } from '@/utils/notificationUtil';

const router = useRouter();
const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref({
  name: '',
  surname: '',
  email: '',
  password: '',
  password_confirmation: '',
  locale: 'en',
});

const nameRules = [
  (v: string) => !!v || 'Name is required'
];

const surnameRules = [
  (v: string) => !!v || 'Surname is required'
];

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters'
];

const confirmPasswordRules = [
  (v: string) => !!v || 'Password confirmation is required',
  (v: string) => v === form.value.password || 'Passwords must match'
];

const locales = [
  { title: 'English', value: 'en' },
  { title: 'Slovak', value: 'sk' }
];

const onSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (valid) {
    loading.value = true;

    try {
      const response = await axiosInstance.post('/auth/register', form.value);

      if (response.type === 'success') {
        showSuccess(response.message || 'Registration successful');

        if (response.token) {
          localStorage.setItem('auth_token', response.token);

          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        showError('Unexpected response format from server');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (errorData.message) {
          showError(errorData.message);
        } else if (errorData.errors) {
          const errors = errorData.errors;
          const firstError = Object.values(errors)[0];
          showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');
        } else {
          showError('Registration failed. Please try again.');
        }
      } else {
        showError('Unable to connect to the server. Please try again later.');
      }
      console.error('Registration error:', err);
    } finally {
      loading.value = false;
    }
  }
};

const goToLogin = () => {
  router.push('/login');
};

const formRef = ref(null);
</script>

<template>
  <ABreadcrumb />

  <div class="flex h-auto p-6">
    <div class="w-full">
      <div class="flex items-center justify-center">
        <v-card class="bg-gray-800/90 rounded-lg shadow-box w-full max-w-2xl px-6 py-8">
          <div class="mb-6 text-center">
            <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-purple-300">Create Account</h2>
            <p class="mt-2 text-gray-400">Sign up for a new account</p>
          </div>

          <v-form ref="formRef" @submit.prevent="onSubmit">
            <v-card-text>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <v-text-field
                    v-model="form.name"
                    label="First Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="nameRules"
                    density="comfortable"
                    bg-color="rgb(31, 41, 55)"
                    color="purple-accent-4"
                ></v-text-field>

                <v-text-field
                    v-model="form.surname"
                    label="Last Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    :rules="surnameRules"
                    density="comfortable"
                    bg-color="rgb(31, 41, 55)"
                    color="purple-accent-4"
                ></v-text-field>
              </div>

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
                  class="mb-4"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
              ></v-text-field>

              <v-text-field
                  v-model="form.password_confirmation"
                  label="Confirm Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check"
                  variant="outlined"
                  :rules="confirmPasswordRules"
                  density="comfortable"
                  bg-color="rgb(31, 41, 55)"
                  color="purple-accent-4"
                  class="mb-4"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
              ></v-text-field>

              <div class="gap-4">
                <v-select
                    v-model="form.locale"
                    label="Preferred Language"
                    :items="locales"
                    item-title="title"
                    item-value="value"
                    prepend-inner-icon="mdi-translate"
                    variant="outlined"
                    density="comfortable"
                    bg-color="rgb(31, 41, 55)"
                    color="purple-accent-4"
                ></v-select>
              </div>
            </v-card-text>

            <v-card-actions class="justify-center px-4 pb-4">
              <v-btn
                  type="submit"
                  block
                  color="purple-accent-2"
                  size="large"
                  :loading="loading"
                  class="text-white mb-3"
              >
                Create Account
              </v-btn>
            </v-card-actions>
            <div class="text-center mt-2 text-sm text-gray-400">
              Already have an account?
              <a @click="goToLogin" class="ml-1 text-purple-300 hover:text-purple-200 cursor-pointer">Sign in</a>
            </div>
          </v-form>
        </v-card>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>