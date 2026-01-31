<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Reports</h1>
      <button class="btn btn-primary">Generate Report</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card">
        <h3 class="font-medium text-gray-600 mb-2">Total Revenue Protected</h3>
        <div class="text-3xl font-bold text-green-600">$45,230</div>
      </div>
      <div class="card">
        <h3 class="font-medium text-gray-600 mb-2">Scope Violations Caught</h3>
        <div class="text-3xl font-bold text-blue-600">127</div>
      </div>
      <div class="card">
        <h3 class="font-medium text-gray-600 mb-2">Change Orders Approved</h3>
        <div class="text-3xl font-bold text-purple-600">23</div>
      </div>
    </div>

    <div class="card">
      <h2 class="text-xl font-bold mb-4">Weekly Digest</h2>
      <p class="text-gray-600">View your weekly scope health summary and trends</p>
      <div class="mt-6 space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium">Week of Jan 22, 2026</div>
              <div class="text-sm text-gray-600">5 projects active, 12 requests processed</div>
            </div>
            <button class="text-blue-600 hover:underline text-sm">View Report</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})
</script>
