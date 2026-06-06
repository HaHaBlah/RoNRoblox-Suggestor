<!-- components/CompParamsResourcer.vue -->
<script setup>
    import { ref, computed } from 'vue';
    import { FandomLists } from '~/composables/FandomLists';
    import CompTagInput from '~/components/CompTagInput.vue';
    import CompOutput from '~/components/CompOutput.vue';

    // Fetch tile lists and maps dynamically
    const { allTilesList, tileOwnersMap } = await FandomLists();

    // Standard resources commonly found in Rise of Nations for the datalist
    const predefinedResources = [
        'Aluminum', 'Chromium', 'Copper', 'Diamond', 'Gold',
        'Iron', 'Oil', 'Phosphate', 'Titanium', 'Tungsten', 'Uranium'
    ];

    const entries = ref([
        { resource: '', tiles: [], amount: null }
    ]);

    const addEntry = () => {
        entries.value.push({ resource: '', tiles: [], amount: null });
    };

    const removeEntry = (index) => {
        entries.value.splice(index, 1);
    };

    const validation = computed(() => {
        const hasErrors = entries.value.length === 0 || entries.value.some(e =>
            !e.resource?.trim() ||
            !e.tiles || e.tiles.length === 0 ||
            e.amount === null || e.amount === ''
        );
        return { hasErrors };
    });

    // Generate Output Text
    const outputText = computed(() => {
        if (validation.value.hasErrors) return "";

        const lines = [];
        lines.push("```lua");

        entries.value.forEach(entry => {
            if (entry.resource && entry.tiles.length > 0 && entry.amount !== null && entry.amount !== '') {
                // Unroll multiple tiles into individual strings
                entry.tiles.forEach(tile => {
                    lines.push(`{"${entry.resource}", "${tile}", ${entry.amount}}`);
                });
            }
        });

        lines.push("```");
        lines.push("--[[");
        lines.push("> -# *Made using [Resourcer](https://ronroblox-suggestor.pages.dev/Resourcer/ )*");
        lines.push("]]");

        return lines.join('\n');
    });
</script>

<template>
    <BContainer fluid class="py-3 px-0">
        <BRow>
            <BCol md="12" class="mb-4">
                <BCard no-body class="border-yellow rounded-0">
                    <BCardHeader class="p-0 bg-grey-active bg-opacity-10">
                        <div class="d-flex justify-content-between align-items-center p-3">
                            <h5 class="mb-0 fw-bold">Resource Suggestions</h5>
                            <BButton variant="outline-green" size="sm" @click="addEntry">+ Add Resource</BButton>
                        </div>
                    </BCardHeader>
                    <BCardBody class="p-3">
                        <div v-if="entries.length === 0" class="text-center text-muted py-3">
                            No resources added. Click "+ Add Resource" to begin.
                        </div>

                        <BListGroup v-else>
                            <BListGroupItem v-for="(entry, index) in entries" :key="index"
                                class="mb-3 border-1 rounded-0 p-3 bg-dark bg-opacity-10">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="fw-bold">Resource #{{ index + 1 }}</span>
                                    <BButton variant="outline-red" size="sm" @click="removeEntry(index)">Remove
                                    </BButton>
                                </div>
                                <BRow class="g-3 align-items-start mt-1">
                                    <BCol md="3">
                                        <BFormGroup label="Resource:" class="fw-bold mb-0">
                                            <BFormInput v-model="entry.resource" list="resource-options"
                                                placeholder="e.g. Copper" />
                                            <datalist id="resource-options">
                                                <option v-for="res in predefinedResources" :key="res" :value="res">
                                                </option>
                                            </datalist>
                                        </BFormGroup>
                                    </BCol>
                                    <BCol md="6">
                                        <BFormGroup label="Tiles:" class="fw-bold mb-0">
                                            <CompTagInput v-model="entry.tiles" :options="allTilesList"
                                                placeholder="e.g. Cyprus.001" emptyMessage="No matching tiles found"
                                                :clearOnSelect="true">

                                                <template #chip="{ item, remove }">
                                                    <span
                                                        class="badge bg-ron-button-dark d-flex align-items-center py-1 ps-2 pe-2 deletable-chip"
                                                        style="font-size: 0.85rem;" @click.stop="remove()">
                                                        <span class="d-flex me-2">
                                                            <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])"
                                                                :key="nation"
                                                                :src="`/api/flag/${encodeURIComponent(nation)}`"
                                                                :alt="nation" :title="nation"
                                                                class="border bg-ron-button-dark shadow-sm"
                                                                style="width: 24px; height: 16px; object-fit: cover; position: relative;"
                                                                :style="{ zIndex: nIdx }" loading="lazy">
                                                        </span>
                                                        {{ item }}
                                                        <button type="button" class="btn-close btn-close-white ms-2"
                                                            style="font-size: 0.5em; pointer-events: none;"
                                                            aria-label="Remove" tabindex="-1"></button>
                                                    </span>
                                                </template>

                                                <template #dropdown-item="{ item }">
                                                    <div class="d-flex align-items-center">
                                                        <span class="d-flex me-3">
                                                            <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])"
                                                                :key="nation"
                                                                :src="`/api/flag/${encodeURIComponent(nation)}`"
                                                                :alt="nation" :title="nation"
                                                                class="border bg-ron-button-dark shadow-sm"
                                                                style="width: 36px; height: 24px; object-fit: cover; position: relative;"
                                                                :style="{ zIndex: nIdx }" loading="lazy">
                                                        </span>
                                                        {{ item }}
                                                    </div>
                                                </template>
                                            </CompTagInput>
                                        </BFormGroup>
                                    </BCol>
                                    <BCol md="3">
                                        <BFormGroup label="Total Amount:" class="fw-bold mb-0">
                                            <BFormInput type="number" v-model.number="entry.amount" placeholder="e.g. 5"
                                                min="0" />
                                        </BFormGroup>
                                    </BCol>
                                </BRow>
                            </BListGroupItem>
                        </BListGroup>
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>

        <BRow>
            <BCol md="12">
                <CompOutput :content="outputText">
                    <div v-if="validation.hasErrors" class="text-red pt-2">
                        Please add at least one resource suggestion and fill out all fields (Resource, Tile, Amount) to
                        generate
                        the format.
                    </div>
                </CompOutput>
            </BCol>
        </BRow>
    </BContainer>
</template>

<style scoped>
    .deletable-chip {
        cursor: pointer;
    }

    .deletable-chip:hover {
        background-color: var(--ron-red) !important;
    }
</style>