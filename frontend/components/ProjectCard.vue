<template>
  <NuxtLink :to="`/projects/${project.id}`" class="card hover:shadow-lg transition block">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="font-bold text-lg mb-1">{{ project.project_name }}</h3>
        <p class="text-gray-600 text-sm">{{ project.client_name }}</p>
      </div>
      <StatusBadge :status="project.status" />
    </div>
    
    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
      <span>Created {{ formatDate(project.created_at) }}</span>
      <span class="text-blue-600 hover:underline">View Details →</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  project: any
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>
