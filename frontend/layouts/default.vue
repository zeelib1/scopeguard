<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold">🛡️ ScopeGuard</h2>
      </div>
      
      <nav class="space-y-2">
        <NuxtLink to="/" class="nav-link">
          <span>📊</span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/projects" class="nav-link">
          <span>📁</span>
          <span>Projects</span>
        </NuxtLink>
        <NuxtLink to="/reports" class="nav-link">
          <span>📈</span>
          <span>Reports</span>
        </NuxtLink>
        <NuxtLink to="/team" class="nav-link">
          <span>👥</span>
          <span>Team</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="nav-link">
          <span>⚙️</span>
          <span>Settings</span>
        </NuxtLink>
      </nav>
      
      <div class="mt-auto pt-8">
        <button @click="handleLogout" class="nav-link text-red-600 w-full">
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 bg-gray-50">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition;
}

.nav-link.router-link-active {
  @apply bg-blue-50 text-blue-600 font-medium;
}
</style>
