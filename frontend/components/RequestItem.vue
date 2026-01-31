<template>
  <div class="card">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h4 class="font-medium">{{ request.description }}</h4>
          <StatusBadge :status="request.status" />
        </div>
        <p class="text-sm text-gray-600">
          <span v-if="request.estimated_hours">{{ request.estimated_hours }} hours</span>
          <span v-if="request.priority" class="ml-2">Priority: {{ request.priority }}</span>
        </p>
        <p class="text-xs text-gray-500 mt-1">{{ formatDate(request.created_at) }}</p>
      </div>
      
      <div v-if="request.status === 'pending'" class="flex gap-2">
        <button 
          @click="approveRequest" 
          :disabled="loading"
          class="text-green-600 hover:bg-green-50 px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {{ loading ? '...' : 'Approve' }}
        </button>
        <button 
          @click="rejectRequest" 
          :disabled="loading"
          class="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {{ loading ? '...' : 'Reject' }}
        </button>
      </div>
    </div>
    
    <div v-if="request.cost_impact || request.estimated_hours" class="mt-3 pt-3 border-t border-gray-100 text-sm">
      <span v-if="request.cost_impact" class="text-gray-600">
        Estimated Impact: <span class="font-medium ml-1">${{ request.cost_impact }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  request: any
}>()

const emit = defineEmits(['update'])

const api = useApi()
const loading = ref(false)

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

const approveRequest = async () => {
  loading.value = true
  try {
    await api.updateRequest(props.request.project_id, props.request.id, {
      status: 'approved'
    })
    emit('update')
  } catch (error) {
    alert('Failed to approve request')
  } finally {
    loading.value = false
  }
}

const rejectRequest = async () => {
  loading.value = true
  try {
    await api.updateRequest(props.request.project_id, props.request.id, {
      status: 'rejected'
    })
    emit('update')
  } catch (error) {
    alert('Failed to reject request')
  } finally {
    loading.value = false
  }
}
</script>
