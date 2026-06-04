<!-- components/CompParamsReleasabler.vue -->
<script setup>
    import { ref, reactive, computed, watch } from 'vue';

    // Assets & Composables
    import unknownFlag from '~/assets/images/Unknown Flag.png';
    import { FandomLists } from '~/composables/FandomLists';
    import CompTagInput from '~/components/CompTagInput.vue';
    import CompOutput from '~/components/CompOutput.vue';

    // State Management
    const state = reactive({
        Name: '',
        Demonym: '',
        Color: '#ffffff',
        Capital: '',
        Flag: '',
        Tiles: [],
        SourcesDescription: ''
    });

    // Fetch Fandom Lists dynamically for Tiles
    const { allTilesList, tileOwnersMap } = await FandomLists();

    // Decal & Flag Logic (Auto-converts Decal to Image ID and fetches preview)
    let decalAbortController = null;
    let flagAbortController = null;
    const flagPreviewSrc = ref(unknownFlag);

    async function onFlagInput(value) {
        state.Flag = value;

        const match = value.match(/\d+/);
        if (!match) return;
        const parsed = match[0];

        decalAbortController?.abort();
        decalAbortController = new AbortController();
        const { signal } = decalAbortController;

        try {
            const data = await $fetch(`/api/roblox-decal?decalid=${encodeURIComponent(parsed)}`, { signal });
            if (data && data.imageId) {
                state.Flag = data.imageId;
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    watch(
        () => state.Flag,
        async (newFlagId) => {
            if (!newFlagId) {
                flagPreviewSrc.value = unknownFlag;
                return;
            }

            const match = newFlagId.match(/\d+/);
            const parsedId = match ? match[0] : newFlagId;

            flagAbortController?.abort();
            flagAbortController = new AbortController();

            try {
                const data = await $fetch(`/api/roblox-thumbnail?assetid=${encodeURIComponent(parsedId)}&size=700x700`, {
                    signal: flagAbortController.signal
                });
                flagPreviewSrc.value = data?.imageUrl || unknownFlag;
            } catch (err) {
                if (err.name === 'AbortError') return;
                flagPreviewSrc.value = unknownFlag;
            }
        },
        { immediate: true }
    );

    // Output Validation
    const validation = computed(() => {
        const errors = [];
        if (!state.Name?.trim()) errors.push('Name');
        if (!state.Demonym?.trim()) errors.push('Demonym');
        if (!state.Color?.trim()) errors.push('Color');
        if (!state.Capital?.trim()) errors.push('Capital');
        if (!state.Flag?.trim()) errors.push('Flag (ID or Link)');
        if (!state.Tiles || state.Tiles.length === 0) errors.push('Tiles');

        return {
            hasErrors: errors.length > 0,
            errors,
        };
    });

    // Output Formatter
    const outputText = computed(() => {
        if (validation.value.hasErrors) return "";

        const match = state.Flag.match(/\d+/);
        const parsedFlagId = match ? match[0] : state.Flag;

        const tilesLuaArray = state.Tiles.length > 0
            ? `{${state.Tiles.map(t => `"${t}"`).join(', ')}}`
            : '{}';

        const luaBlock = [
            `{`,
            `\tName = "${state.Name}",`,
            `\tDemonym = "${state.Demonym}",`,
            `\tColor = "${state.Color}",`,
            `\tCapital = "${state.Capital}",`,
            `\tFlag = "rbxassetid://${parsedFlagId}",`,
            `\tTiles = ${tilesLuaArray},`,
            `}`
        ].join('\n');

        const metaData = [];
        if (parsedFlagId) {
            metaData.push(`Flag Image: [https://create.roblox.com/store/asset/${parsedFlagId}]`);
        }

        const outputLines = [
            "```lua",
            luaBlock,
            "```",
            "--[["
        ];

        if (state.SourcesDescription.trim()) {
            outputLines.push("# __Description/Sources__");
            outputLines.push(state.SourcesDescription.trim());
            outputLines.push("");
        }

        if (metaData.length > 0) {
            outputLines.push(metaData.join('\n'));
            outputLines.push("");
        }

        outputLines.push("> -# *Made using [Releasabler](https://ronroblox-suggestor.pages.dev/Releasabler/ )*");
        outputLines.push("]]");

        return outputLines.join('\n');
    });
</script>

<template>
    <BContainer fluid class="py-3 px-0">
        <div class="text-center mb-4 mt-3">
            <div class="d-inline-block">
                <img :src="flagPreviewSrc" alt="Releasable Flag Preview"
                    style="max-height: 150px; object-fit: contain;" />
            </div>
        </div>

        <BRow>
            <BCol md="12" class="mb-4">
                <BCard no-body class="border-yellow rounded-0">
                    <BCardHeader class="p-0 bg-grey-active bg-opacity-10">
                        <div class="w-100 text-start p-3">
                            <h5 class="mb-0 fw-bold">General Information</h5>
                        </div>
                    </BCardHeader>
                    <BCardBody class="p-3">
                        <BRow>
                            <BCol md="4">
                                <BFormGroup label="Name:" class="fw-bold mb-3">
                                    <BFormInput v-model="state.Name" placeholder="e.g. Brittany"
                                        :state="state.Name ? null : false" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="4">
                                <BFormGroup label="Demonym:" class="fw-bold mb-3">
                                    <BFormInput v-model="state.Demonym" placeholder="e.g. Breton"
                                        :state="state.Demonym ? null : false" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="4">
                                <BFormGroup label="Capital City:" class="fw-bold mb-3">
                                    <BFormInput v-model="state.Capital" placeholder="e.g. Rennes"
                                        :state="state.Capital ? null : false" />
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCard>
            </BCol>

            <BCol md="12" class="mb-4">
                <BCard no-body class="border-yellow rounded-0">
                    <BCardHeader class="p-0 bg-grey-active bg-opacity-10">
                        <div class="w-100 text-start p-3">
                            <h5 class="mb-0 fw-bold">Visuals</h5>
                        </div>
                    </BCardHeader>
                    <BCardBody class="p-3">
                        <BRow>
                            <BCol md="6">
                                <BFormGroup label="Map Color (Hex):" class="fw-bold mb-3">
                                    <BInputGroup>
                                        <BFormInput type="color" v-model="state.Color"
                                            style="max-width: 50px; padding: 0.25rem; cursor: pointer;" />
                                        <BFormInput v-model="state.Color" placeholder="#ffffff"
                                            :state="state.Color ? null : false" />
                                    </BInputGroup>
                                </BFormGroup>
                            </BCol>
                            <BCol md="6">
                                <BFormGroup label="Link To Flag / Decal ID:" class="fw-bold mb-3">
                                    <BFormInput :model-value="state.Flag" @update:model-value="onFlagInput"
                                        placeholder="e.g. 111582974903309" :state="state.Flag ? null : false" />
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCard>
            </BCol>

            <BCol md="12" class="mb-4">
                <BCard no-body class="border-yellow rounded-0">
                    <BCardHeader class="p-0 bg-grey-active bg-opacity-10">
                        <div class="w-100 text-start p-3">
                            <h5 class="mb-0 fw-bold">Territory & Context</h5>
                        </div>
                    </BCardHeader>
                    <BCardBody class="p-3">
                        <BRow>
                            <BCol md="12">
                                <BFormGroup label="Required Tiles:" class="fw-bold mb-3">
                                    <CompTagInput v-model="state.Tiles" :options="allTilesList"
                                        placeholder="e.g. France.001, France.002" emptyMessage="No matching tiles found"
                                        :state="state.Tiles.length > 0 ? null : false" :clearOnSelect="false">

                                        <template #chip="{ item, remove }">
                                            <span
                                                class="badge bg-ron-button-dark d-flex align-items-center py-1 ps-2 pe-2 deletable-chip"
                                                style="font-size: 0.85rem;" @click.stop="remove()">
                                                <span class="d-flex me-2">
                                                    <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])"
                                                        :key="nation" :src="`/api/flag/${encodeURIComponent(nation)}`"
                                                        :alt="nation" :title="nation"
                                                        class="border bg-ron-button-dark shadow-sm"
                                                        style="width: 24px; height: 16px; object-fit: cover; position: relative;"
                                                        :style="{ zIndex: nIdx }" loading="lazy">
                                                </span>
                                                {{ item }}
                                                <button type="button" class="btn-close btn-close-white ms-2"
                                                    style="font-size: 0.5em; pointer-events: none;" aria-label="Remove"
                                                    tabindex="-1"></button>
                                            </span>
                                        </template>

                                        <template #dropdown-item="{ item }">
                                            <div class="d-flex align-items-center">
                                                <span class="d-flex me-3">
                                                    <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])"
                                                        :key="nation" :src="`/api/flag/${encodeURIComponent(nation)}`"
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

                            <BCol md="12">
                                <BFormGroup label="Sources / Descriptions (Optional):" class="fw-bold mb-0">
                                    <BFormTextarea v-model="state.SourcesDescription"
                                        placeholder="Explain the historical context or provide source links here..."
                                        rows="2" max-rows="6" />
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>

        <BRow>
            <BCol md="12">
                <CompOutput :content="outputText">
                    <div v-if="validation.hasErrors" class="text-red pt-2">
                        <h6 class="fw-bold mb-3">Missing required inputs:</h6>
                        <ul class="mb-0 text-start d-inline-block">
                            <li v-for="(error, idx) in validation.errors" :key="idx">{{ error }}</li>
                        </ul>
                    </div>
                    <div v-else>
                        Please fill out all required fields to generate the Lua block.
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