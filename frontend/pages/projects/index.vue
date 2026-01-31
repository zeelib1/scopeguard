<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Projects</h1>
      <NuxtLink to="/projects/new" class="btn btn-primary">+ New Project</NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-12">Loading...</div>
    
    <div v-else-if="projects.length === 0" class="card text-center py-12">
      <p class="text-gray-600 mb-4">No projects yet</p>
      <NuxtLink to="/projects/new" class="btn btn-primary">Create Your First Project</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const api = useApi()
const projects = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response: any = await api.getProjects()
    projects.value = response.projects || []
  } finally {
    loading.value = false
  }
})
</script>
