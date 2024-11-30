<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosInstance from "@/plugins/axios";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const groups = ref([]);

const fetchGroups = async () => {
  try {
    const response = await axiosInstance.get('/meta-data/groups');
    groups.value = response;
  } catch (err) {
    console.error('Failed to load groups:', err);
  }
};

onMounted(() => {
  fetchGroups();
});
</script>

<template>
  <Disclosure as="nav" class="bg-gray-800" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button -->
          <DisclosureButton class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block size-6" aria-hidden="true" />
            <XMarkIcon v-else class="block size-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex shrink-0 items-center">
            <img class="h-8 w-auto" src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" />
          </div>
          <div class="hidden sm:ml-6 sm:block">
            <div class="flex items-center h-full space-x-4">
              <!-- Home -->
              <div>
                <router-link
                    to="/home"
                    class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-lg"
                >
                  Home
                </router-link>
              </div>

              <!-- Groups -->
              <div v-for="group in groups" :key="group.group_value" class="relative group">
                <router-link
                    :to="`/${group.group_value}`"
                    class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-4 py-2 text-lg block"
                >
                  {{ group.group_name }}
                </router-link>

                <!-- Sensor dropdowns -->
                <ul class="absolute hidden bg-gray-700 text-gray-300 group-hover:block rounded-md shadow-lg min-w-full">
                  <li v-for="sensor in group.sensors" :key="sensor.type">
                    <router-link
                        :to="`/${group.group_value}/${sensor.type}`"
                        class="block px-4 py-2 hover:bg-gray-600 hover:text-white hover:rounded-md"
                    >
                      {{ sensor.display_name }}
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <button type="button" class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
            <span class="sr-only">View notifications</span>
            <BellIcon class="size-6" aria-hidden="true" />
          </button>

          <!-- Profile dropdown -->
          <Menu as="div" class="relative ml-3">
            <div>
              <MenuButton class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span class="sr-only">Open user menu</span>
                <img class="size-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <MenuItem v-slot="{ active }">
                  <router-link to="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Your Profile</router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link to="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Settings</router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <router-link to="#" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">Sign out</router-link>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <DisclosurePanel class="sm:hidden">
      <div class="space-y-1 px-2 pb-3 pt-2">
        <router-link
            v-for="group in groups"
            :key="group.group_value"
            :to="`/${group.group_value}`"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
        >
          {{ group.group_name }}
        </router-link>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<style scoped>

</style>