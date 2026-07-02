<!-- components/CompParamsFormabler.vue -->
<script setup>
    import { computed, ref, reactive, watch } from 'vue';

    // Swiper Imports
    import { Swiper, SwiperSlide } from 'swiper/vue';
    import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
    import 'swiper/css';
    import 'swiper/css/effect-coverflow';
    import 'swiper/css/pagination';
    import 'swiper/css/navigation';
    import '~/assets/style.css';

    // Assets & Composables
    import unknownFlag from '~/assets/images/Unknown Flag.png';
    import { FormablerOutput } from '~/composables/FormablerOutput';
    import { FandomLists } from '~/composables/FandomLists';
    import CompTagInput from '~/components/CompTagInput.vue';
    import CompAddModifier from '~/components/CompAddModifier.vue';

    const modules = [EffectCoverflow, Pagination, Navigation];

    const state = reactive({
        type: 'Formable',
        name: '',
        Demonym: '',
        FlagId: '',
        buttonTitle: '',
        buttonDescription: '',
        alertTitle: '',
        alertDescription: '',
        alertButton: '',
        CountriesCanForm: [],
        RequiredCountries: [],
        RequiredTiles: [],
        ExclusiveFormables: [],
        Modifiers: [],

        // CustomAttributes
        DoNotClearModifiers: '',
        Stability_Gain: '',
        PoliticalPower_Gain: '',
        Stability_Requirement: '',
        Rename_Cities: [{}],

        // Metadata
        SourcesDescription: ''
    });

    const stateRef = computed(() => state);
    const { outputText, validation } = FormablerOutput(stateRef);

    // Fetch lists and maps dynamically
    const {
        allCountriesList,
        baseCountriesList,
        formablesList,
        allTilesList,
        tileOwnersMap,
        modifiersList,
        modifierEffectsData
    } = await FandomLists();

    // Dynamically populated flags
    const availableFlags = ref([
        { id: 'unknown', src: unknownFlag, name: 'Unknown Flag' }
    ]);

    let decalAbortController = null;

    async function onFlagIdInput(value) {
        state.FlagId = value;

        const match = value.match(/\d+/);
        if (!match) return;
        const parsed = match[0];

        decalAbortController?.abort();
        decalAbortController = new AbortController();
        const { signal } = decalAbortController;

        try {
            const data = await $fetch(`/api/roblox-decal?decalid=${encodeURIComponent(parsed)}`, { signal });

            if (data && data.imageId) {
                state.FlagId = data.imageId;
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    let flagAbortController = null;

    // Watch for changes to update flags dynamically
    watch(
        [() => state.type, () => state.FlagId, () => state.CountriesCanForm],
        async ([newType, newFlagId, newCountries]) => {
            if (newType === 'Mission') {
                if (newCountries && newCountries.length > 0) {
                    availableFlags.value = newCountries.map(country => ({
                        id: country,
                        src: `/api/flag/${encodeURIComponent(country)}`,
                        name: country
                    }));
                } else {
                    availableFlags.value = [{ id: 'unknown', src: unknownFlag, name: 'Unknown Flag' }];
                }
            } else {
                if (!newFlagId) {
                    availableFlags.value = [{ id: 'unknown', src: unknownFlag, name: 'Unknown Flag' }];
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
                    availableFlags.value = [{ id: parsedId, src: data.imageUrl, name: 'Formable Flag' }];
                } catch (err) {
                    if (err.name === 'AbortError') return;
                    availableFlags.value = [{ id: 'error', src: unknownFlag, name: 'Unknown Flag' }];
                }
            }
        },
        { immediate: true, deep: true }
    );

    const nationFlagSrc = ref(availableFlags.value[0].src);

    const toggleFormableType = () => {
        state.type = state.type === 'Formable' ? 'Mission' : 'Formable';
    };

    const onSlideChange = (swiper) => {
        const selectedFlag = availableFlags.value[swiper.activeIndex];
        if (selectedFlag) {
            nationFlagSrc.value = selectedFlag.src;
        }
    };

    const isGeneralInfoOpen = ref(true);
    const isDisplayAlertsOpen = ref(true);
    const isRequirementsOpen = ref(true);
    const isModifiersOpen = ref(true);
    const isAttributesOpen = ref(true);
    const isAdditionalRequirementsOpen = ref(true);

    // --- MODIFIER UI LOGIC ---
    const showNewModModal = ref(false);

    const selectedExistingMods = ref([]);

    const modifierTitlesList = computed(() => {
        return modifiersList.value
            .map(m => m.Title)
            .filter(title => !state.Modifiers.some(mod => mod.Title === title));
    });

    const getModifierIcon = (title) => {
        const mod = modifiersList.value.find(m => m.Title === title);
        return mod ? mod.IconID : null;
    };

    // Reactive Icon Cache ---
    const iconCache = reactive({});

    const getIconUrl = (iconId) => {
        if (!iconId) return '';

        if (iconCache[iconId] !== undefined) {
            return iconCache[iconId];
        }

        iconCache[iconId] = '';

        $fetch(`/api/roblox-thumbnail?assetid=${encodeURIComponent(iconId)}&size=150x150`)
            .then(data => {
                if (data && data.imageUrl) {
                    iconCache[iconId] = data.imageUrl;
                }
            })
            .catch(err => {
                console.error(`Failed to fetch modifier icon for ${iconId}:`, err);
            });

        return '';
    };

    watch(selectedExistingMods, (newVal) => {
        if (newVal && newVal.length > 0) {
            newVal.forEach(title => {
                const mod = modifiersList.value.find(m => m.Title === title);
                if (mod) {
                    state.Modifiers.push({
                        type: 'existing',
                        Title: mod.Title,
                        Description: mod.Description,
                        IconID: mod.IconID,
                        Effects: mod.Effects,
                        length: '',
                        infinite: false,
                        DoNotClear: false
                    });
                }
            });
            selectedExistingMods.value = [];
        }
    }, { deep: true });

    // Handle incoming modifier from our extracted component
    const handleAddCustomModifier = (newModifier) => {
        state.Modifiers.push(newModifier);
    };

    const removeModifier = (index) => {
        state.Modifiers.splice(index, 1);
    };

    // --- EFFECT COLOR LOGIC ---
    const getEffectColorClass = (key, val) => {
        let numVal = 0;
        let unit = '';

        if (Array.isArray(val)) {
            numVal = Number(val[0]);
            unit = val[1] || '';
        } else {
            numVal = Number(val);
        }

        const effects = modifierEffectsData.value?.modifiereffectsdata || {};
        const info = effects[key];
        const alignment = info?.alignment;

        if (alignment === 'AlwaysYellow') return 'text-warning';

        let isHigher = false;
        let isLower = false;
        let isEqual = false;

        if (unit === 'x') {
            isHigher = numVal > 1;
            isLower = numVal < 1;
            isEqual = numVal === 1;
        } else {
            isHigher = numVal > 0;
            isLower = numVal < 0;
            isEqual = numVal === 0;
        }

        if (alignment === 'PositiveIsGreen') {
            if (isHigher) return 'text-green';
            if (isLower) return 'text-red';
            if (isEqual) return 'text-gold';
        }

        if (alignment === 'NegativeIsGreen') {
            if (isLower) return 'text-green';
            if (isHigher) return 'text-red';
            if (isEqual) return 'text-gold';
        }

        return 'text-white';
    };
</script>

<template>
    <div class="text-center mb-4 mt-3">
        <BButton size="lg" variant="primary" class="mb-3" @click="toggleFormableType">
            {{ state.type }}
        </BButton>

        <swiper :effect="'coverflow'" :grabCursor="true" :centeredSlides="true" :slidesPerView="'auto'"
            :navigation="true" :coverflowEffect="{
                rotate: 10, stretch: 100, depth: 100, modifier: 1, slideShadows: true
            }" :pagination="{ type: 'fraction' }" :modules="modules" @slideChange="onSlideChange"
            class="mySwiper mb-3 shadow-sm">
            <swiper-slide v-for="(flag, index) in availableFlags" :key="index">
                <img :src="flag.src" :alt="`${state.type} Flag - ${flag.name}`" style="max-height: 150px;" />
            </swiper-slide>
        </swiper>
    </div>

    <BRow>
        <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isGeneralInfoOpen = !isGeneralInfoOpen">
                        <h5 class="mb-0 fw-bold text-reset">General Information</h5>
                        <span class="text-reset">{{ isGeneralInfoOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isGeneralInfoOpen">
                    <BCardBody class="position-relative p-3 ">
                        <BRow>
                            <BCol md="12">
                                <BFormGroup :label="`${state.type} Name:`" class="fw-bold mb-1">
                                    <BFormInput v-model="state.name" :placeholder="`${state.type} Name`"
                                        :state="state.name ? null : false" />
                                </BFormGroup>
                            </BCol>

                            <BCol md="6" v-if="state.type === 'Formable'">
                                <BFormGroup label="Demonym:" class="fw-bold mb-1">
                                    <BFormInput v-model="state.Demonym" placeholder="Demonym" />
                                </BFormGroup>
                            </BCol>

                            <BCol md="6" v-if="state.type === 'Formable'">
                                <BFormGroup label="Link To Flag:" class="fw-bold mb-1">
                                    <BFormInput :model-value="state.FlagId" @update:model-value="onFlagIdInput"
                                        placeholder="e.g. https://create.roblox.com/store/asset/111582974903309" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="12">
                                <BFormGroup label="Sources/Description:" class="fw-bold mb-0">
                                    <BFormTextarea v-model="state.SourcesDescription" placeholder="Sources/Description"
                                        rows="1" max-rows="5" />
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCollapse>
            </BCard>
        </BCol>

        <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isDisplayAlertsOpen = !isDisplayAlertsOpen">
                        <h5 class="mb-0 fw-bold text-reset">In-Game Display & Alerts</h5>
                        <span class="text-reset">{{ isDisplayAlertsOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isDisplayAlertsOpen">
                    <BCardBody class="position-relative p-3 ">
                        <BRow>
                            <BCol md="6">
                                <BFormGroup label="Button Title:" class="fw-bold mb-3">
                                    <BFormInput v-model="state.buttonTitle" placeholder="Button Title"
                                        :state="state.buttonTitle ? null : false" />
                                </BFormGroup>
                                <BFormGroup label="Button Description:" class="fw-bold mb-3">
                                    <BFormTextarea v-model="state.buttonDescription" placeholder="Button Description"
                                        rows="4" max-rows="8" :state="state.buttonDescription ? null : false" />
                                </BFormGroup>
                            </BCol>

                            <BCol md="6">
                                <BRow>
                                    <BCol md="12">
                                        <BFormGroup label="Alert Title:" class="fw-bold mb-3">
                                            <BFormInput v-model="state.alertTitle" placeholder="Alert Title" />
                                        </BFormGroup>
                                    </BCol>
                                    <BCol md="12">
                                        <BFormGroup label="Alert Description:" class="fw-bold mb-0">
                                            <BFormTextarea v-model="state.alertDescription"
                                                placeholder="Alert Description" rows="2" max-rows="8" />
                                        </BFormGroup>
                                    </BCol>
                                    <BCol md="12">
                                        <BFormGroup label="Alert Button Text:" class="fw-bold mb-3">
                                            <BFormInput v-model="state.alertButton" placeholder="Ending Statement" />
                                        </BFormGroup>
                                    </BCol>
                                </BRow>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCollapse>
            </BCard>
        </BCol>

        <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isRequirementsOpen = !isRequirementsOpen">
                        <h5 class="mb-0 fw-bold text-reset">Requirements</h5>
                        <span class="text-reset">{{ isRequirementsOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isRequirementsOpen">
                    <BCardBody class="position-relative p-3 ">
                        <BRow>
                            <BCol md="12">
                                <BFormGroup label="Countries that can form:" class="fw-bold mb-3">
                                    <CompTagInput v-model="state.CountriesCanForm" :options="allCountriesList"
                                        placeholder="e.g. United States, Scotland, Byzantine Empire"
                                        :state="state.CountriesCanForm.length > 0 ? null : false" />
                                </BFormGroup>
                            </BCol>

                            <BCol md="6">
                                <BFormGroup label="Countries Required to Form:" class="fw-bold mb-3">
                                    <CompTagInput v-model="state.RequiredCountries" :options="baseCountriesList"
                                        placeholder="e.g. United States, Scotland, Algeria"
                                        :state="(state.RequiredCountries.length > 0 || state.RequiredTiles.length > 0) ? null : false" />
                                </BFormGroup>
                            </BCol>

                            <BCol md="6">
                                <BFormGroup label="Tiles Required to Form:" class="fw-bold mb-3">
                                    <CompTagInput v-model="state.RequiredTiles" :options="allTilesList"
                                        placeholder="e.g. UnitedStates.001, Swisterland.003"
                                        emptyMessage="No matching tiles found"
                                        :state="(state.RequiredCountries.length > 0 || state.RequiredTiles.length > 0) ? null : false"
                                        :clearOnSelect="false">
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

                            <BCol md="6">
                                <BFormGroup label="Exclusive Formables:" class="fw-bold mb-0">
                                    <CompTagInput v-model="state.ExclusiveFormables" :options="formablesList"
                                        placeholder="e.g. European Union" emptyMessage="No matching formables found" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="6">
                                <BFormGroup label="Minimum Stability Required:" class="fw-bold mb-3">
                                    <BFormInput type="number" min="0" max="100" v-model="state.Stability_Requirement"
                                        placeholder="Minimum Stability Required" />
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCollapse>
            </BCard>
        </BCol>

        <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isModifiersOpen = !isModifiersOpen">
                        <h5 class="mb-0 fw-bold text-reset">Modifiers</h5>
                        <span class="text-reset">{{ isModifiersOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isModifiersOpen">
                    <BCardBody class="position-relative p-3">
                        <BRow>
                            <BCol md="12">
                                <BFormGroup label="Add Modifiers:" class="fw-bold mb-3">
                                    <div
                                        class="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-start">
                                        <CompTagInput v-model="selectedExistingMods" :options="modifierTitlesList"
                                            placeholder="Search & Add Existing Modifier..."
                                            emptyMessage="No matching modifiers found" :clearOnSelect="true"
                                            class="flex-grow-1">
                                            <template #chip="{ item, remove }">
                                                <span
                                                    class="badge bg-ron-button-dark d-flex align-items-center py-1 ps-2 pe-2 deletable-chip"
                                                    style="font-size: 0.85rem;" @click.stop="remove()">
                                                    {{ item }}
                                                    <button type="button" class="btn-close btn-close-white ms-2"
                                                        style="font-size: 0.5em; pointer-events: none;"
                                                        aria-label="Remove" tabindex="-1"></button>
                                                </span>
                                            </template>

                                            <template #dropdown-item="{ item }">
                                                <div class="d-flex align-items-center">
                                                    <img v-if="getModifierIcon(item) && getIconUrl(getModifierIcon(item))"
                                                        :src="getIconUrl(getModifierIcon(item))" alt="Icon"
                                                        class="me-2  "
                                                        style="width: 28px; height: 28px; object-fit: contain;" />
                                                    {{ item }}
                                                </div>
                                            </template>
                                        </CompTagInput>

                                        <BButton variant="green" @click="showNewModModal = true"
                                            class="text-nowrap w-100 w-md-auto">
                                            Add Custom Modifier
                                        </BButton>
                                    </div>
                                </BFormGroup>

                                <BListGroup v-if="state.Modifiers.length > 0">
                                    <BListGroupItem v-for="(mod, index) in state.Modifiers" :key="index"
                                        class="mb-3 border-1 rounded-0">
                                        <div class="d-flex justify-content-between align-items-start mb-2">

                                            <div class="d-flex gap-3 align-items-center">
                                                <div class="bg-secondary bg-opacity-25"
                                                    style="width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;">

                                                    <img v-if="mod.IconID && getIconUrl(mod.IconID)"
                                                        :src="getIconUrl(mod.IconID)" alt="Mod Icon"
                                                        style="max-width: 50px; max-height: 50px; object-fit: contain;" />

                                                    <span v-else-if="mod.IconID"
                                                        class="spinner-border spinner-border-sm text-secondary"
                                                        role="status"></span>

                                                    <span v-else class="text-muted small">No Icon</span>
                                                </div>
                                                <div>
                                                    <h6 class="mb-0 fw-bold">
                                                        {{ mod.Title }}
                                                        <BBadge v-if="mod.type === 'new'" variant="primary"
                                                            class="ms-2">
                                                            Custom
                                                        </BBadge>
                                                    </h6>
                                                    <span class="fst-italic mt-1 d-block text-muted small mt-1">{{
                                                        mod.Description || 'No description provided.' }}</span>

                                                </div>
                                            </div>

                                            <BButton variant="red" size="sm" @click="removeModifier(index)">X
                                            </BButton>
                                        </div>

                                        <BRow class="border-top pt-1">
                                            <BCol md="6">
                                                <BCol md="12" class="mb-2">
                                                    <BFormGroup label="Length (Days)" class="fw-bold mb-3">
                                                        <BFormInput type="number" v-model.number="mod.length"
                                                            :disabled="mod.infinite" min="-1"
                                                            placeholder="Enter Modifier Duration"
                                                            :state="(mod.length !== '' && mod.length !== null && mod.length !== undefined) ? null : false" />
                                                    </BFormGroup>
                                                </BCol>
                                                <BCol md="12">
                                                    <BFormCheckbox v-model="mod.infinite"
                                                        @change="mod.infinite ? mod.length = -1 : mod.length = ''">
                                                        Infinite Duration (-1)
                                                    </BFormCheckbox>
                                                </BCol>
                                                <BCol md="12">
                                                    <BFormCheckbox v-model="mod.DoNotClear">
                                                        DoNotClear
                                                    </BFormCheckbox>
                                                </BCol>
                                            </BCol>
                                            <BCol md="6">
                                                <div class="mt-3"
                                                    v-if="mod.Effects && Object.keys(mod.Effects).length > 0">
                                                    <span class="small fw-bold text-light opacity-75">Effects:</span>
                                                    <div class="d-flex flex-wrap gap-2 mt-1">
                                                        <ul v-if="mod.Effects && Object.keys(mod.Effects).length > 0"
                                                            class="mb-0 list-unstyled d-grid"
                                                            style="grid-template-columns: max-content 1fr; column-gap: 1rem; row-gap: 0.25rem;">

                                                            <template v-for="(val, key) in mod.Effects" :key="key">
                                                                <li class="fw-bold">{{ key }}:</li>
                                                                <li>
                                                                    <span v-if="Array.isArray(val)"
                                                                        :class="getEffectColorClass(key, val)">
                                                                        {{ val[0] }}{{ (val[1] && val[1] !== 'Base') ?
                                                                            val[1] : '' }}
                                                                    </span>
                                                                    <span v-else
                                                                        :class="getEffectColorClass(key, val)">{{ val
                                                                        }}</span>
                                                                </li>
                                                            </template>

                                                        </ul>
                                                    </div>
                                                </div>
                                            </BCol>
                                        </BRow>
                                    </BListGroupItem>
                                </BListGroup>

                                <div v-else class="text-center text-muted p-3">
                                    No modifiers added yet.
                                </div>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCollapse>

                <CompAddModifier v-model="showNewModModal" @add-modifier="handleAddCustomModifier" />
            </BCard>
        </BCol>

        <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isAttributesOpen = !isAttributesOpen">
                        <h5 class="mb-0 fw-bold text-reset">Attributes</h5>
                        <span class="text-reset">{{ isAttributesOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isAttributesOpen">
                    <BCardBody class="position-relative p-3">
                        <BRow>
                            <BCol md="12">
                                <BFormCheckbox v-model="state.DoNotClearModifiers" class="fw-bold mb-3"
                                    placeholder="Do Not Clear Modifiers">
                                    Do Not Clear Modifiers
                                </BFormCheckbox>
                            </BCol>
                            <BCol md="6">
                                <BFormGroup label="Stability Gain:" class="fw-bold mb-3">
                                    <BFormInput type="number" v-model="state.Stability_Gain"
                                        placeholder="Stability Gain" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="6">
                                <BFormGroup label="Political Power Gain:" class="fw-bold mb-3">
                                    <BFormInput type="number" v-model="state.PoliticalPower_Gain"
                                        placeholder="Set to negative to make it a requirement" />
                                </BFormGroup>
                            </BCol>
                            <BCol md="12">
                                <BFormGroup label="Rename Cities:" class="fw-bold mb-3">
                                    <BRow v-for="(cityPair, index) in state.Rename_Cities" :key="index" class="mb-2">
                                        <BCol md="6">
                                            <BFormInput type="text" v-model="state.Rename_Cities[index].city"
                                                placeholder="Original City Name" />
                                        </BCol>
                                        <BCol md="6">
                                            <div class="d-flex gap-2">
                                                <BFormInput type="text" v-model="state.Rename_Cities[index].newName"
                                                    placeholder="New City Name" class="flex-grow-1" />
                                                <BButton variant="red" size="sm"
                                                    @click="state.Rename_Cities.splice(index, 1)">X
                                                </BButton>
                                            </div>
                                        </BCol>
                                    </BRow>
                                    <BButton size="sm" variant="outline-green"
                                        @click="state.Rename_Cities.push({ city: '', newName: '' })">
                                        + Add City
                                    </BButton>
                                </BFormGroup>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCollapse>
            </BCard>
        </BCol>
         <BCol md="12" class="mb-4">
            <BCard no-body class="border-yellow rounded-0">
                <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
                    <BButton variant="link"
                        class="w-100 text-decoration-none text-start d-flex justify-content-between align-items-center p-3"
                        @click="isAdditionalRequirementsOpen = !isAdditionalRequirementsOpen">
                        <h5 class="mb-0 fw-bold text-reset">Additional Requirements </h5><span class="text-red">(Unconfirmed formats, proceed at own risk)</span>
                        <span class="text-reset">{{ isAdditionalRequirementsOpen ? '▼' : '◀' }}</span>
                    </BButton>
                </BCardHeader>

                <BCollapse v-model="isAdditionalRequirementsOpen">
                    <BCardBody class="position-relative p-3">
                        <BRow>
                            <BCol md="12">
                                <BFormCheckbox v-model="state.DoNotClearModifiers" class="fw-bold mb-3"
                                    placeholder="Do Not Clear Modifiers">
                                    Do Not Clear Modifiers
                                </BFormCheckbox>
                            </BCol>
                           
                        </BRow>
                    </BCardBody>
                </BCollapse>
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
                    Please input the {{ state.type }} Name and fill out all required fields.
                </div>
            </CompOutput>
        </BCol>
    </BRow>
</template>

<style scoped>
    .mySwiper {
        width: 100%;
        max-width: 600px;
        padding-top: 20px;
        padding-bottom: 20px;
    }

    .swiper-slide {
        width: auto;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .deletable-chip {
        cursor: pointer;
    }

    .deletable-chip:hover {
        background-color: var(--ron-red) !important;
    }
</style>