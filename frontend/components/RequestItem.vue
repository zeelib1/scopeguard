<template>
  <div class="card">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h4 class="font-medium">{{ request.description }}</h4>
          <StatusBadge :status="request.status" />
        </div>
        <p class="text-sm text-gray-600">From: {{ request.client_name || 'Client' }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ formatDate(request.created_at) }}</p>
      </div>
      
      <div class="flex gap-2">
        <button class="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm">Approve</button>
        <button class="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm">Reject</button>
      </div>
    </div>
    
    <div v-if="request.cost_impact" class="mt-3 pt-3 border-t border-gray-100 text-sm">
      <span class="text-gray-600">Estimated Impact:</span>
      <span class="font-medium ml-2">${{ request.cost_impact }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  request: any
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}
</script>
