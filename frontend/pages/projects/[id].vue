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
        <h3 class="font-bold text-lg">Client Requests</h3>
        <button class="btn btn-primary btn-sm" @click="showRequestForm = true">+ New Request</button>
      </div>
      <div v-if="requests.length === 0" class="card text-center py-8 text-gray-600">
        No requests yet
      </div>
      <RequestItem v-for="req in requests" :key="req.id" :request="req" />
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
        <button class="btn btn-primary btn-sm">+ Create Change Order</button>
      </div>
      <div v-if="changeOrders.length === 0" class="card text-center py-8 text-gray-600">
        No change orders yet
      </div>
      <ChangeOrderCard v-for="co in changeOrders" :key="co.id" :changeOrder="co" />
    </div>

    <div v-if="activeTab === 'Budget'">
      <BudgetGauge :projectId="project.id" />
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

const tabs = ['Overview', 'Requests', 'Scope Items', 'Change Orders', 'Budget']

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
