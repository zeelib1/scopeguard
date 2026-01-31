<template>
  <div class="card">
    <h3 class="font-bold text-lg mb-6">Budget Overview</h3>
    
    <div v-if="loading" class="text-center py-8">Loading...</div>
    
    <div v-else-if="budget" class="space-y-6">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-600 mb-1">Total Budget</div>
          <div class="text-2xl font-bold">${{ formatMoney(budget.project?.budgetAmount || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-1">Spent</div>
          <div class="text-2xl font-bold text-orange-600">${{ formatMoney(budget.costs?.actual || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-1">Remaining</div>
          <div class="text-2xl font-bold text-green-600">${{ formatMoney(budget.health?.remaining || 0) }}</div>
        </div>
      </div>
      
      <div>
        <div class="flex justify-between text-sm mb-2">
          <span>Budget Usage</span>
          <span class="font-medium">{{ budget.health?.percentUsed || 0 }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4">
          <div 
            class="h-4 rounded-full transition-all"
            :class="budgetColorClass"
            :style="`width: ${Math.min(budget.health?.percentUsed || 0, 100)}%`"
          ></div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <div class="text-sm text-gray-600 mb-1">Change Order Revenue</div>
          <div class="font-medium">${{ formatMoney(budget.revenue?.changeOrders || 0) }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-600 mb-1">Total Profit</div>
          <div class="font-medium text-green-600">${{ formatMoney(budget.profit?.actual || 0) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  projectId: number
}>()

const api = useApi()
const budget = ref(null)
const loading = ref(true)

const budgetColorClass = computed(() => {
  const percent = (budget.value as any)?.health?.percentUsed || 0
  if (percent >= 100) return 'bg-red-600'
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 75) return 'bg-yellow-500'
  return 'bg-blue-600'
})

const formatMoney = (amount: number) => {
  return amount.toLocaleString()
}

onMounted(async () => {
  try {
    budget.value = await api.getProjectBudget(props.projectId)
  } catch (err) {
    console.error('Failed to load budget:', err)
  } finally {
    loading.value = false
  }
})
</script>
