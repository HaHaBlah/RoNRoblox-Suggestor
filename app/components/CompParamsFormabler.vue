<!-- components/CompParamsFormabler.vue -->
<script setup>
    import { computed, ref, reactive, watch } from 'vue'; // Added 'watch'

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
        Modifiers: ''
    });

    const stateRef = computed(() => state);
    const { outputText, validation } = FormablerOutput(stateRef);

    // Fetch lists and maps dynamically
    const {
        allCountriesList,
        baseCountriesList,
        formablesList,
        allTilesList,
        tileOwnersMap
    } = await FandomLists();

    // Dynamically populated flags
    const availableFlags = ref([
        { id: 'unknown', src: unknownFlag, name: 'Unknown Flag' }
    ]);

    let flagAbortController = null;

    // Watch for changes to update flags dynamically
    watch(
        [() => state.type, () => state.FlagId, () => state.CountriesCanForm],
        async ([newType, newFlagId, newCountries]) => {
            if (newType === 'Mission') {
                // If Mission, populate Swiper with all CountriesCanForm flags
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
                // If Formable, fetch the Roblox thumbnail based on FlagId
                if (!newFlagId) {
                    availableFlags.value = [{ id: 'unknown', src: unknownFlag, name: 'Unknown Flag' }];
                    return;
                }

                // Extract the numeric ID from the URL or raw input
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
                    // Fallback to unknown flag if the fetch fails
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
</script>

<template>
    <h1 class="text-center text-red">WORK IN PROGRESS, DOES NOT WORK YET</h1>
    <div class="text-center mb-4 mt-3">
        <BButton variant="primary" class="mb-3" @click="toggleFormableType">
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
        <BCol md="12">
            <BFormGroup :label="`${state.type} Name:`" class="fw-bold">
                <BFormInput v-model="state.name" :placeholder="`${state.type} Name`"
                    :state="state.name ? null : false" />
            </BFormGroup>
        </BCol>

        <BCol md="12" v-if="state.type === 'Formable'">
            <BFormGroup label="Demonym:" class="fw-bold">
                <BFormInput v-model="state.Demonym" placeholder="Demonym" />
            </BFormGroup>
        </BCol>

        <BCol md="12" v-if="state.type === 'Formable'">
            <BFormGroup label="Link To Flag:" class="fw-bold">
                <BFormInput v-model="state.FlagId"
                    placeholder="e.g. https://create.roblox.com/store/asset/111582974903309" />
            </BFormGroup>
        </BCol>

        <BCol md="6">
            <BFormGroup label="Button Title:" class="fw-bold">
                <BFormInput v-model="state.buttonTitle" placeholder="Button Title"
                    :state="state.buttonTitle ? null : false"  />
            </BFormGroup>
        </BCol>

        <BCol md="6">
            <BFormGroup label="Button Description:" class="fw-bold">
                <BFormTextarea v-model="state.buttonDescription" placeholder="Button Description" rows="2" max-rows="8"
                    :state="state.buttonDescription ? null : false" />
            </BFormGroup>
        </BCol>

        <BCol md="3">
            <BFormGroup label="Alert Title:" class="fw-bold">
                <BFormInput v-model="state.alertTitle" placeholder="Alert Title" />
            </BFormGroup>
        </BCol>

        <BCol md="6">
            <BFormGroup label="Alert Description:" class="fw-bold">
                <BFormTextarea v-model="state.alertDescription" placeholder="Alert Description" rows="2" max-rows="8" />
            </BFormGroup>
        </BCol>

        <BCol md="3">
            <BFormGroup label="Alert Button Text:" class="fw-bold">
                <BFormInput v-model="state.alertButton" placeholder="Ending Statement" />
            </BFormGroup>
        </BCol>

        <BCol md="12">
            <BFormGroup label="Countries that can form:" class="fw-bold">
                <CompTagInput v-model="state.CountriesCanForm" :options="allCountriesList"
                    placeholder="e.g. United States, Scotland, Byzantine Empire" />
            </BFormGroup>
        </BCol>

        <BCol md="6">
            <BFormGroup label="Countries Required to Form:" class="fw-bold">
                <CompTagInput v-model="state.RequiredCountries" :options="baseCountriesList"
                    placeholder="e.g. United States, Scotland, Algeria" />
            </BFormGroup>
        </BCol>

        <BCol md="6">
            <BFormGroup label="Tiles Required to Form:" class="fw-bold">
                <CompTagInput v-model="state.RequiredTiles" :options="allTilesList"
                    placeholder="e.g. UnitedStates.001, Swisterland.003" emptyMessage="No matching tiles found">
                    <template #chip="{ item, remove }">
                        <span class="badge bg-primary d-flex align-items-center py-1 ps-2 pe-2"
                            style="font-size: 0.85rem;">
                            <span class="d-flex me-2">
                                <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])" :key="nation"
                                    :src="`/api/flag/${encodeURIComponent(nation)}`" :alt="nation" :title="nation"
                                    class="border bg-ron-button-dark shadow-sm"
                                    style="width: 24px; height: 16px; object-fit: cover; margin-left: -8px; position: relative;"
                                    :style="{ zIndex: nIdx }" loading="lazy">
                            </span>
                            {{ item }}
                            <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 0.5em;"
                                @click.stop="remove()" aria-label="Remove"></button>
                        </span>
                    </template>

                    <template #dropdown-item="{ item }">
                        <span class="d-flex me-3 ps-2">
                            <img v-for="(nation, nIdx) in (tileOwnersMap[item] || [])" :key="nation"
                                :src="`/api/flag/${encodeURIComponent(nation)}`" :alt="nation" :title="nation"
                                class="border bg-ron-button-dark shadow-sm"
                                style="width: 36px; height: 24px; object-fit: cover; margin-left: -12px; position: relative;"
                                :style="{ zIndex: nIdx }" loading="lazy">
                        </span>
                        {{ item }}
                    </template>
                </CompTagInput>
            </BFormGroup>
        </BCol>

        <BCol md="12">
            <BFormGroup label="Exclusive Formables:" class="fw-bold">
                <CompTagInput v-model="state.ExclusiveFormables" :options="formablesList"
                    placeholder="e.g. European Union" emptyMessage="No matching formables found" />
            </BFormGroup>
        </BCol>

        <BCol md="12">
            <BFormGroup label="Modifiers:" class="fw-bold">
                <BFormInput v-model="state.Modifiers" placeholder="Modifiers" />
            </BFormGroup>
        </BCol>
    </BRow>

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
</style>