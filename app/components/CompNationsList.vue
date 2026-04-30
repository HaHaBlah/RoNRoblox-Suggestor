<!-- CompNationsList.vue -->
<script setup lang="ts">
    import { ref, computed } from 'vue'

    // Types 
    interface NationEntry { nation: boolean }
    interface FormableEntry { FormableName?: string; Removed?: boolean }

    interface FandomData {
        Nationdata: { nationdata: Record<string, NationEntry> }
        Tagdata: { Tags: Record<string, FormableEntry> }
        flagMap: Record<string, string>;
    }

    // Data 
    const emit = defineEmits<{ select: [name: string] }>()

    const { data, status, error } = await useFetch<FandomData>('/api/fandom-data')

    const nations = computed(() =>
        data.value
            ? Object.entries(data.value.Nationdata.nationdata)
                .filter(([, v]) => v.nation === true)
                .map(([k]) => k)
                .sort()
            : []
    )

    const releasables = computed(() =>
        data.value
            ? Object.entries(data.value.Nationdata.nationdata)
                .filter(([, v]) => v.nation === false)
                .map(([k]) => k)
                .sort()
            : []
    )

    const formables = computed(() =>
        data.value
            ? Object.values(data.value.Tagdata.Tags)
                .filter(f => f.FormableName && !f.Removed)
                .map(f => f.FormableName!)
                .sort()
            : []
    )

    // Tab + Search 
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
    <BContainer fluid>
        <!-- Tabs -->
        <BRow>
            <BNav tabs>
                <BNavItem v-for="tab in (['Nations', 'Releasables', 'Formables'] as const)" :key="tab"
                    :active="tabIndex === tab" @click="tabIndex = tab">
                    {{ tab }}
                </BNavItem>
            </BNav>
        </BRow>

        <!-- Search -->
        <BRow class="my-2">
            <span>Search: </span>
            <BFormInput v-model="searchQuery" type="text" :placeholder="`Filter ${tabIndex.toLowerCase()}...`" />
        </BRow>

        <!-- List -->
        <BRow>
            <div class="content-area mt-2">
                <div v-if="status === 'pending'" class="text-muted">Loading...</div>
                <div v-else-if="error" class="text-danger">Failed to load: {{ error.message }}</div>
                <ul v-else class="nations-list list-unstyled">
                    <li v-for="name in filteredList" :key="name">
                        <BButton class="btn text-start w-100" @click="emit('select', name)">
                            <!-- Pass the pre-resolved URL directly from the data map -->
                            <CompFlagImage :name="name" :src="data?.flagMap?.[name]" />
                            {{ name }}
                        </BButton>
                    </li>
                    <li v-if="filteredList.length === 0" class="text-muted fst-italic ps-2">
                        No results for "{{ searchQuery }}"
                    </li>
                </ul>
            </div>
        </BRow>
    </BContainer>
</template>