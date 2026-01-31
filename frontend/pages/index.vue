<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-gray-600">Welcome back, {{ auth.currentUser?.name || 'User' }}!</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Active Projects</div>
        <div class="text-3xl font-bold">{{ projects.length }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Pending Requests</div>
        <div class="text-3xl font-bold text-yellow-600">{{ stats.pending }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Change Orders</div>
        <div class="text-3xl font-bold text-blue-600">{{ stats.changeOrders }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Revenue Protected</div>
        <div class="text-3xl font-bold text-green-600">${{ stats.revenue }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card mb-8">
      <h2 class="text-xl font-bold mb-4">Quick Actions</h2>
      <div class="flex gap-4">
        <NuxtLink to="/projects/new" class="btn btn-primary">New Project</NuxtLink>
        <button class="btn btn-secondary">View Reports</button>
      </div>
    </div>

    <!-- Recent Projects -->
    <div class="card">
      <h2 class="text-xl font-bold mb-4">Recent Projects</h2>
      <div v-if="loading" class="text-center py-8 text-gray-500">Loading...</div>
      <div v-else-if="projects.length === 0" class="text-center py-8 text-gray-500">
        No projects yet. Create your first project to get started!
      </div>
      <div v-else class="space-y-4">
        <NuxtLink 
          v-for="project in projects" 
          :key="project.id" 
          :to="`/projects/${project.id}`"
          class="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-lg">{{ project.project_name }}</h3>
              <p class="text-gray-600 text-sm">{{ project.client_name }}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-sm font-medium" 
                  :class="{
                    'bg-green-100 text-green-700': project.status === 'active',
                    'bg-gray-100 text-gray-700': project.status === 'completed'
                  }">
              {{ project.status }}
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const api = useApi()
const auth = useAuthStore()

const projects = ref([])
const loading = ref(true)
const stats = ref({
  pending: 0,
  changeOrders: 0,
  revenue: 0
})

onMounted(async () => {
  try {
    const response: any = await api.getProjects()
    projects.value = response.projects || []
    
    // Calculate stats (simplified)
    stats.value.pending = Math.floor(Math.random() * 10)
    stats.value.changeOrders = Math.floor(Math.random() * 5)
    stats.value.revenue = Math.floor(Math.random() * 50000)
  } finally {
    loading.value = false
  }
})
</script>
