<!-- components/CompNationsList.vue -->
<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface NationEntry { nation: boolean }
  interface FormableEntry { FormableName?: string; Removed?: boolean }

  interface FandomData {
    Nationdata: { nationdata: Record<string, NationEntry> }
    Tagdata: { Tags: Record<string, FormableEntry> }
    flagMap: Record<string, string>
  }

  const emit = defineEmits<{ select: [name: string] }>()
  const { data, status, error } = await useFetch<FandomData>('/api/fandom-data')

  const nations = computed(() => data.value ? Object.entries(data.value.Nationdata.nationdata).filter(([, v]) => v.nation === true).map(([k]) => k).sort() : [])
  const releasables = computed(() => data.value ? Object.entries(data.value.Nationdata.nationdata).filter(([, v]) => v.nation === false).map(([k]) => k).sort() : [])
  const formables = computed(() => data.value ? Object.values(data.value.Tagdata.Tags).filter(f => f.FormableName && !f.Removed).map(f => f.FormableName!).sort() : [])

  type Tab = 'Nations' | 'Releasables' | 'Formables'
  const tabIndex = ref<Tab>('Nations')
  const searchQuery = ref('')

  const activeList = computed<string[]>(() => {
    const map: Record<Tab, string[]> = {
      Nations: nations.value,
      Releasables: releasables.value,
      Formables: formables.value,
    }
    return map[tabIndex.value]
  })

  const filteredList = computed(() => {
    const q = searchQuery.value.trim().toUpperCase()
    return q ? activeList.value.filter(n => n.toUpperCase().includes(q)) : activeList.value
  })
</script>

<template>
  <div class="h-100 d-flex flex-column">
    <BFormGroup class="mb-2">
      <BFormInput v-model="searchQuery" :placeholder="`Filter ${tabIndex.toLowerCase()}...`" type="search" />
    </BFormGroup>

    <BNav pills justified class="mb-3">
      <BNavItem 
        v-for="tab in (['Nations', 'Releasables', 'Formables'] as const)" 
        :key="tab"
        :active="tabIndex === tab" 
        @click="tabIndex = tab"
      >
        {{ tab }}
      </BNavItem>
    </BNav>

    <div class="flex-grow-1 overflow-auto" style="max-height: 70vh;">
      <div v-if="status === 'pending'" class="text-center text-muted p-4">
        <BSpinner class="mb-2" />
        <p>Loading nations...</p>
      </div>
      <BAlert v-else-if="error" variant="danger" show>
        Failed to load: {{ error.message }}
      </BAlert>
      <BListGroup v-else>
        <BListGroupItem 
          v-for="name in filteredList" 
          :key="name" 
          button 
          class="d-flex align-items-center"
          @click="emit('select', name)"
        >
          <img v-if="data?.flagMap?.[name]" :src="data.flagMap[name]" :alt="name" class="me-3 border" style="width: 36px; height: 24px; object-fit: cover;">
          <div v-else class="me-3 bg-secondary" style="width: 36px; height: 24px;"></div>
          {{ name }}
        </BListGroupItem>
        <BListGroupItem v-if="filteredList.length === 0" class="text-muted fst-italic text-center">
          No results for "{{ searchQuery }}"
        </BListGroupItem>
      </BListGroup>
    </div>
  </div>
</template>