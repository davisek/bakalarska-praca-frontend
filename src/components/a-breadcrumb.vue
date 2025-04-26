<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $route = useRoute();
const homeRoutes = ['/', '/dashboard', '/admin'];
const isHome = computed(() => homeRoutes.includes($route.path));

const breadcrumbItems = computed(() => {
  const segments = $route.path.split("/").filter(Boolean);
  const breadcrumb = [];

  segments.forEach((segment, index) => {
    if (segment === "dashboard" && index === 0 && !isHome.value) {
      breadcrumb.push({
        name: t('nav.dashboard'),
        path: "/dashboard",
      });
    } else if (segment === "groups" && index === 0) {
      breadcrumb.push({
        name: t('nav.groups'),
        path: "/" + segment,
      });
    } else if (segment === "statistics" && index === 0) {
      breadcrumb.push({
        name: t('nav.statistics'),
        path: "/" + segment,
      });
    } else if (segment === "users" && index === 1) {
      breadcrumb.push({
        name: t('admin.nav.usersManagement'),
        path: null,
      });
    } else if (segment === "sensors" && index === 1) {
      breadcrumb.push({
        name: t('admin.nav.sensorsManagement'),
        path: null,
      });
    } else {
      const isLast = index === segments.length - 1;
      breadcrumb.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: !isLast
            ? "/" + segments.slice(0, index + 1).join("/")
            : null,
      });
    }
  });

  return breadcrumb;
});
</script>

<template>
  <div class="flex items-center space-x-2 mb-6">
    <router-link to="/" class="flex items-center hover:text-purple-600 dark:hover:text-purple-400">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    </router-link>

    <template v-for="(item, index) in breadcrumbItems" :key="index">
      <span class="text-gray-500 dark:text-gray-400">/</span>
      <router-link
          v-if="item.path"
          :to="item.path"
          class="text-lg font-bold hover:text-purple-600 dark:hover:text-purple-400"
      >
        {{ item.name }}
      </router-link>
      <span v-else class="text-lg font-bold text-purple-300 dark:text-purple-400">
        {{ item.name }}
      </span>
    </template>
  </div>
</template>