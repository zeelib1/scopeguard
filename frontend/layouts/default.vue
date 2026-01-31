<template>
  <div class="min-h-screen flex">
    <!-- Mobile Menu Button -->
    <button 
      @click="mobileMenuOpen = !mobileMenuOpen"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
    >
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Sidebar -->
    <aside 
      class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 p-6 transform transition-transform lg:transform-none"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="mb-8 mt-12 lg:mt-0">
        <h2 class="text-2xl font-bold">🛡️ ScopeGuard</h2>
      </div>
      
      <nav class="space-y-2">
        <NuxtLink to="/" class="nav-link" @click="mobileMenuOpen = false">
          <span>📊</span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/projects" class="nav-link" @click="mobileMenuOpen = false">
          <span>📁</span>
          <span>Projects</span>
        </NuxtLink>
        <NuxtLink to="/reports" class="nav-link" @click="mobileMenuOpen = false">
          <span>📈</span>
          <span>Reports</span>
        </NuxtLink>
        <NuxtLink to="/team" class="nav-link" @click="mobileMenuOpen = false">
          <span>👥</span>
          <span>Team</span>
        </NuxtLink>
        <NuxtLink to="/settings" class="nav-link" @click="mobileMenuOpen = false">
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

    <!-- Backdrop for mobile -->
    <div 
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 bg-gray-50 lg:ml-0">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

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
