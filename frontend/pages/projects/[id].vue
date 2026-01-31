<template>
  <div v-if="loading" class="text-center py-12">Loading...</div>
  
  <div v-else-if="project">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-start mb-4">
        <div>
          <NuxtLink to="/projects" class="text-blue-600 hover:underline text-sm mb-2 inline-block">← Back to Projects</NuxtLink>
          <h1 class="text-3xl font-bold">{{ project.project_name }}</h1>
          <p class="text-gray-600">{{ project.client_name }}</p>
        </div>
        <StatusBadge :status="project.status" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <div class="flex gap-8">
        <button 
          v-for="tab in tabs" 
          :key="tab" 
          @click="activeTab = tab"
          class="pb-4 px-2 font-medium transition"
          :class="activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'Overview'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="font-bold mb-4">Scope Health</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span>Overall Usage</span>
              <span class="font-medium">{{ overview?.usage || 0 }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="`width: ${overview?.usage || 0}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold mb-4">Recent Activity</h3>
        <div class="text-sm text-gray-600">
          <p>Last updated: {{ new Date(project.updated_at).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Requests'" class="space-y-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex gap-2">
          <button 
            v-if="selectedRequests.length" 
            @click="bulkApprove" 
            class="btn btn-sm bg-green-600 text-white hover:bg-green-700"
          >
            ✓ Approve Selected ({{ selectedRequests.length }})
          </button>
          <button 
            v-if="selectedRequests.length" 
            @click="bulkReject" 
            class="btn btn-sm bg-red-600 text-white hover:bg-red-700"
          >
            ✗ Reject Selected ({{ selectedRequests.length }})
          </button>
        </div>
        <button class="btn btn-primary btn-sm" @click="showRequestForm = true">+ New Request</button>
      </div>
      <div v-if="requests.length === 0" class="card text-center py-8 text-gray-600">
        No requests yet
      </div>
      <div v-else class="space-y-2">
        <div v-for="req in requests" :key="req.id" class="flex items-start gap-2">
          <input 
            type="checkbox" 
            :value="req.id" 
            v-model="selectedRequests" 
            class="mt-1"
            v-if="req.status === 'pending'"
          />
          <RequestItem :request="req" @update="loadRequests" class="flex-1" />
        </div>
      </div>
      
      <!-- Request Form Modal -->
      <div v-if="showRequestForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showRequestForm = false">
        <div class="max-w-2xl w-full">
          <RequestForm :projectId="projectId" @success="handleRequestSuccess" @cancel="showRequestForm = false" />
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Scope Items'">
      <div class="card">
        <h3 class="font-bold mb-4">Defined Scope</h3>
        <div v-if="scopeItems.length === 0" class="text-center py-8 text-gray-600">
          No scope items defined yet
        </div>
        <div v-else class="space-y-3">
          <div v-for="item in scopeItems" :key="item.id" class="p-4 border rounded-lg">
            <p class="font-medium">{{ item.description }}</p>
            <div class="text-sm text-gray-600 mt-1">
              Used: {{ item.used_count || 0 }} / {{ item.limit_value }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Change Orders'">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">Change Orders</h3>
        <button class="btn btn-primary btn-sm" @click="showChangeOrderForm = true">+ Create Change Order</button>
      </div>
      <div v-if="changeOrders.length === 0" class="card text-center py-8 text-gray-600">
        No change orders yet
      </div>
      <ChangeOrderCard v-for="co in changeOrders" :key="co.id" :changeOrder="co" />
      
      <!-- Change Order Form Modal -->
      <div v-if="showChangeOrderForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" @click.self="showChangeOrderForm = false">
        <div class="max-w-2xl w-full">
          <ChangeOrderForm 
            :projectId="projectId" 
            :approvedRequests="approvedRequests"
            @success="handleChangeOrderSuccess" 
            @cancel="showChangeOrderForm = false" 
          />
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Budget'">
      <BudgetGauge :projectId="project.id" />
    </div>

    <div v-if="activeTab === 'Time'">
      <TimeTracker :projectId="project.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const api = useApi()

const projectId = Number(route.params.id)
const project = ref(null)
const overview = ref(null)
const requests = ref([])
const scopeItems = ref([])
const changeOrders = ref([])
const loading = ref(true)
const activeTab = ref('Overview')
const showRequestForm = ref(false)
const showChangeOrderForm = ref(false)
const selectedRequests = ref<number[]>([])

const tabs = ['Overview', 'Requests', 'Scope Items', 'Change Orders', 'Budget', 'Time']

const approvedRequests = computed(() => {
  return requests.value.filter((r: any) => r.status === 'approved')
})

const loadRequests = async () => {
  const res: any = await api.getRequests(projectId)
  requests.value = res.requests || []
}

const loadChangeOrders = async () => {
  const res: any = await api.getChangeOrders(projectId)
  changeOrders.value = res.changeOrders || []
}

const handleRequestSuccess = async () => {
  showRequestForm.value = false
  await loadRequests()
}

const handleChangeOrderSuccess = async () => {
  showChangeOrderForm.value = false
  await loadChangeOrders()
  await loadRequests()
}

const bulkApprove = async () => {
  if (!confirm(`Approve ${selectedRequests.value.length} requests?`)) return
  
  try {
    await Promise.all(
      selectedRequests.value.map(id => 
        api.updateRequest(projectId, id, { status: 'approved' })
      )
    )
    selectedRequests.value = []
    await loadRequests()
  } catch (err) {
    alert('Failed to approve requests')
  }
}

const bulkReject = async () => {
  if (!confirm(`Reject ${selectedRequests.value.length} requests?`)) return
  
  try {
    await Promise.all(
      selectedRequests.value.map(id => 
        api.updateRequest(projectId, id, { status: 'rejected' })
      )
    )
    selectedRequests.value = []
    await loadRequests()
  } catch (err) {
    alert('Failed to reject requests')
  }
}

onMounted(async () => {
  try {
    const response: any = await api.getProject(projectId)
    project.value = response.project
    overview.value = response.overview

    // Load additional data
    const [reqRes, scopeRes, coRes]: any[] = await Promise.all([
      api.getRequests(projectId),
      api.getScopeItems(projectId),
      api.getChangeOrders(projectId)
    ])

    requests.value = reqRes.requests || []
    scopeItems.value = scopeRes.scopeItems || []
    changeOrders.value = coRes.changeOrders || []
  } finally {
    loading.value = false
  }
})
</script>
