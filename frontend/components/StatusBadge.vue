<template>
  <span 
    class="px-3 py-1 rounded-full text-xs font-medium uppercase"
    :class="statusClass"
  >
    {{ status }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const statusClass = computed(() => {
  const classes: Record<string, string> = {
    'active': 'bg-green-100 text-green-700',
    'completed': 'bg-blue-100 text-blue-700',
    'archived': 'bg-gray-100 text-gray-700',
    'pending': 'bg-yellow-100 text-yellow-700',
    'approved': 'bg-green-100 text-green-700',
    'rejected': 'bg-red-100 text-red-700',
    'in-scope': 'bg-green-100 text-green-700',
    'out-of-scope': 'bg-orange-100 text-orange-700'
  }
  return classes[props.status] || 'bg-gray-100 text-gray-700'
})
</script>
