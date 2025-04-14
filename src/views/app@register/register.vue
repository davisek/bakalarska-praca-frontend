<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/plugins/axios';
import ABreadcrumb from "@/components/a-breadcrumb.vue";
import { showSuccess, showError } from '@/utils/notificationUtil';
import {Enum} from "@/types";

const router = useRouter();
const isLoading = ref(false);
const formSubmitted = ref(false);
const locales = ref<Enum>(null)

const form = ref({
  name: '',
  surname: '',
  email: '',
  password: '',
  password_confirmation: '',
  locale: 'en',
});

const nameError = ref('');
const surnameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const passwordConfirmationError = ref('');

const validateName = () => {
  if (!form.value.name) {
    nameError.value = 'Name is required';
    return false;
  }
  nameError.value = '';
  return true;
};

const validateSurname = () => {
  if (!form.value.surname) {
    surnameError.value = 'Surname is required';
    return false;
  }
  surnameError.value = '';
  return true;
};

const validateEmail = () => {
  if (!form.value.email) {
    emailError.value = 'Email is required';
    return false;
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(form.value.email)) {
    emailError.value = 'Email must be valid';
    return false;
  }
  emailError.value = '';
  return true;
};

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'Password is required';
    return false;
  } else if (form.value.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters';
    return false;
  }
  passwordError.value = '';
  return true;
};

const validatePasswordConfirmation = () => {
  if (!form.value.password_confirmation) {
    passwordConfirmationError.value = 'Password confirmation is required';
    return false;
  } else if (form.value.password_confirmation !== form.value.password) {
    passwordConfirmationError.value = 'Passwords must match';
    return false;
  }
  passwordConfirmationError.value = '';
  return true;
};

const getLocale = async () => {
  isLoading.value = true;
  try {
    const response = await axiosInstance.get(`/auth/locale`);
    locales.value = response.locales;
  } catch (error) {
    showError('Unknown error.');
  } finally {
    isLoading.value = false;
  }
}

const onSubmit = async () => {
  formSubmitted.value = true;

  const isNameValid = validateName();
  const isSurnameValid = validateSurname();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isPasswordConfirmationValid = validatePasswordConfirmation();

  if (isNameValid && isSurnameValid && isEmailValid && isPasswordValid && isPasswordConfirmationValid) {
    isLoading.value = true;

    try {
      const response = await axiosInstance.post('/auth/register', form.value);
      if (response.type === 'success') {
        showSuccess(response.message);
      } else {
        showError(response.message);
      }

      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);

        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (errorData.message) {
          showError(errorData.message);
        } else if (errorData.errors) {
          const errors = errorData.errors;

          const firstErrorField = Object.keys(errors)[0];
          const firstError = errors[firstErrorField];
          showError(Array.isArray(firstError) ? firstError[0] : 'Validation error');

          if (errors.name) nameError.value = errors.name[0];
          if (errors.surname) surnameError.value = errors.surname[0];
          if (errors.email) emailError.value = errors.email[0];
          if (errors.password) passwordError.value = errors.password[0];
          if (errors.password_confirmation) passwordConfirmationError.value = errors.password_confirmation[0];
        } else {
          showError('Registration failed. Please try again.');
        }
      } else {
        showError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      isLoading.value = false;
    }
  }
};

onMounted(async () => {
  await getLocale();
});

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <ABreadcrumb />

  <div class="flex h-auto lg:p-6 p-0">
    <div class="w-full">
      <div class="flex items-center justify-center">
        <div class="bg-gray-800/90 rounded-lg shadow-box w-full max-w-2xl px-6 py-8">
          <div class="mb-6 text-center">
            <div class="rounded-full p-3 bg-gradient-to-tr from-purple-600 to-purple-300 shadow-glow w-16 h-16 mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-purple-300">Create Account</h2>
            <p class="mt-2 text-gray-400">Sign up for a new account</p>
          </div>

          <Form @submit.prevent="onSubmit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="flex flex-col gap-1">
                <InputText
                    v-model="form.name"
                    :invalid="!!nameError"
                    variant="outlined"
                    name="name"
                    placeholder="First Name"
                    @blur="validateName"
                />
                <Message v-if="nameError" severity="error" size="small" variant="simple">{{ nameError }}</Message>
              </div>

              <div class="flex flex-col gap-1">
                <InputText
                    v-model="form.surname"
                    :invalid="!!surnameError"
                    variant="outlined"
                    name="surname"
                    placeholder="Last Name"
                    @blur="validateSurname"
                />
                <Message v-if="surnameError" severity="error" size="small" variant="simple">{{ surnameError }}</Message>
              </div>
            </div>

            <div class="flex flex-col gap-1 mb-4">
              <InputText
                  v-model="form.email"
                  :invalid="!!emailError"
                  variant="outlined"
                  name="email"
                  type="email"
                  placeholder="Email"
                  @blur="validateEmail"
              />
              <Message v-if="emailError" severity="error" size="small" variant="simple">{{ emailError }}</Message>
            </div>

            <div class="flex flex-col gap-1 mb-4">
              <Password
                  v-model="form.password"
                  :invalid="!!passwordError"
                  variant="outlined"
                  inputClass="w-full"
                  :toggleMask="true"
                  placeholder="Password"
                  @blur="validatePassword"
              />
              <Message v-if="passwordError" severity="error" size="small" variant="simple">{{ passwordError }}</Message>
            </div>

            <div class="flex flex-col gap-1 mb-4">
              <Password
                  v-model="form.password_confirmation"
                  :invalid="!!passwordConfirmationError"
                  variant="outlined"
                  inputClass="w-full"
                  :feedback="false"
                  :toggleMask="true"
                  placeholder="Confirm Password"
                  @blur="validatePasswordConfirmation"
              />
              <Message v-if="passwordConfirmationError" severity="error" size="small" variant="simple">{{ passwordConfirmationError }}</Message>
            </div>

            <div class="flex flex-col gap-1 mb-6">
              <SelectButton
                  v-model="form.locale"
                  :options="locales"
                  optionLabel="label"
                  optionValue="value"
                  :disabled="!locales"
              >
                <template #option="locale">
                  <div class="flex items-center">
                    <img
                        v-if="locale.option.symbol"
                        :src="locale.option.symbol"
                        :alt="locale.option.label"
                        class="w-5 h-5 mr-2"
                    />
                    <span>{{ locale.option.label }}</span>
                  </div>
                </template>
              </SelectButton>
            </div>

            <div class="mb-4">
              <Button
                  type="submit"
                  label="Create Account"
                  severity="help"
                  icon="pi pi-user-plus"
                  :isLoading="isLoading"
                  class="w-full"
              />
            </div>

            <div class="text-center mt-2 text-sm text-gray-400">
              Already have an account?
              <a @click="goToLogin" class="ml-1 text-purple-300 hover:text-purple-200 cursor-pointer">Sign in</a>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>