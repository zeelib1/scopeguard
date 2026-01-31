<template>
  <div class="card">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h4 class="font-bold">{{ changeOrder.title }}</h4>
        <p class="text-sm text-gray-600 mt-1">{{ changeOrder.description }}</p>
      </div>
      <StatusBadge :status="changeOrder.status" />
    </div>
    
    <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
      <div>
        <div class="text-sm text-gray-600">Cost</div>
        <div class="font-bold text-lg">${{ changeOrder.price }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Time Est.</div>
        <div class="font-bold text-lg">{{ changeOrder.time_estimate }}h</div>
      </div>
    </div>
    
    <div class="mt-4 flex gap-2">
      <button v-if="changeOrder.status === 'pending'" class="btn btn-primary btn-sm flex-1">Approve</button>
      <button v-if="changeOrder.status === 'pending'" class="btn btn-danger btn-sm flex-1">Reject</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  changeOrder: any
}>()
</script>
