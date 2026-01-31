<template>
  <div class="card">
    <h3 class="text-lg font-bold mb-4">Generate Change Order</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Select Approved Requests</label>
        <div class="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
          <div v-for="request in approvedRequests" :key="request.id" class="flex items-start gap-2">
            <input 
              type="checkbox" 
              :value="request.id" 
              v-model="form.request_ids"
              class="mt-1"
            />
            <div class="flex-1">
              <p class="text-sm">{{ request.description }}</p>
              <p class="text-xs text-gray-500">{{ request.estimated_hours }} hours</p>
            </div>
          </div>
          <div v-if="approvedRequests.length === 0" class="text-sm text-gray-500 text-center py-4">
            No approved requests available
          </div>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Change Order Title</label>
        <input 
          v-model="form.title" 
          required 
          class="input" 
          placeholder="Additional Features - Phase 2"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Description (Optional)</label>
        <textarea 
          v-model="form.description" 
          rows="3" 
          class="input" 
          placeholder="Summary of changes..."
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-1">Additional Cost ($)</label>
        <input 
          v-model.number="form.additional_cost" 
          type="number" 
          required 
          class="input" 
          placeholder="1000"
          min="0"
          step="10"
        />
      </div>
      
      <div class="flex gap-2">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading || form.request_ids.length === 0"
        >
          {{ loading ? 'Generating...' : 'Generate Change Order' }}
        </button>
        <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
          Cancel
        </button>
      </div>
      
      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: number
  approvedRequests: any[]
}>()

const emit = defineEmits(['success', 'cancel'])

const api = useApi()
const loading = ref(false)
const error = ref('')

const form = reactive({
  request_ids: [] as number[],
  title: '',
  description: '',
  additional_cost: 0
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await api.createChangeOrder(props.projectId, form)
    emit('success')
    
    // Reset form
    form.request_ids = []
    form.title = ''
    form.description = ''
    form.additional_cost = 0
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to create change order'
  } finally {
    loading.value = false
  }
}
</script>
