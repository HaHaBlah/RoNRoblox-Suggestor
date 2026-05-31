<!-- CompParamsFormabler.vue -->
<script setup>
    import { computed, ref, reactive } from 'vue';

    // Import Swiper Vue.js components and modules
    import { Swiper, SwiperSlide } from 'swiper/vue';
    import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

    // Import Swiper styles
    import 'swiper/css';
    import 'swiper/css/effect-coverflow';
    import 'swiper/css/pagination';
    import 'swiper/css/navigation';
    import '~/assets/style.css';

    // Image imports
    import unknownFlag from '~/assets/images/Unknown Flag.png';

    // Import our new composable
    import { FormablerOutput } from '~/composables/FormablerOutput';

    // Swiper modules
    const modules = [EffectCoverflow, Pagination, Navigation];

    // Mock data for flags 
    const availableFlags = ref([
        { id: 'unknown', src: unknownFlag, name: 'Unknown Flag' },
        { id: 'abstract_1', src: 'https://swiperjs.com/demos/images/abstract-1.jpg', name: 'Flag 1' },
        { id: 'abstract_2', src: 'https://swiperjs.com/demos/images/abstract-2.jpg', name: 'Flag 2' },
        { id: 'abstract_3', src: 'https://swiperjs.com/demos/images/abstract-3.jpg', name: 'Flag 3' },
    ]);

    // Reactive State
    const state = reactive({
        type: 'Formable',
        name: '',
        demonym: '',
        flagId: '',
        buttonTitle: '',
        buttonDescription: '',
        alertTitle: '',
        alertDescription: '',
        alertButton: '',
        countriesThatCanForm: '',
        requiredNations: '',
        exclusiveFormables: '',
        modifiers: ''
    });

    // Pass the state to our new composable
    const stateRef = computed(() => state);
    const { outputText, validation } = FormablerOutput(stateRef);

    // Toggle between 'Formable' and 'Mission'
    const toggleFormableType = () => {
        state.type = state.type === 'Formable' ? 'Mission' : 'Formable';
    };

    const nationFlagSrc = ref(availableFlags.value[0].src);

    // Fetch the fandom data
    const { data: fandomData } = await useFetch('/api/fandom-data');

    // --- LIST GENERATION START ---
    
    // List 1: EVERYTHING (For "Countries That Can Form")
    const allCountriesList = computed(() => {
        if (!fandomData.value) return [];
        const nations = Object.entries(fandomData.value.Nationdata?.nationdata || {})
            .filter(([, v]) => v.nation === true).map(([k]) => k);
        const releasables = Object.entries(fandomData.value.Nationdata?.nationdata || {})
            .filter(([, v]) => v.nation === false).map(([k]) => k);
        const formables = Object.values(fandomData.value.Tagdata?.Tags || {})
            .filter(f => f.FormableName && !f.Removed).map(f => f.FormableName);

        return [...new Set([...nations, ...releasables, ...formables])].sort();
    });

    // List 2: BASE NATIONS & RELEASABLES ONLY (For "Countries Required to Form")
    const baseCountriesList = computed(() => {
        if (!fandomData.value) return [];
        const nations = Object.entries(fandomData.value.Nationdata?.nationdata || {})
            .filter(([, v]) => v.nation === true).map(([k]) => k);
        const releasables = Object.entries(fandomData.value.Nationdata?.nationdata || {})
            .filter(([, v]) => v.nation === false).map(([k]) => k);
            
        return [...new Set([...nations, ...releasables])].sort();
    });
    // --- LIST GENERATION END ---


    // COUNTRIES THAT CAN FORM
    const showCanFormDropdown = ref(false);

    const filteredCanForm = computed(() => {
        const parts = state.countriesThatCanForm.split(',');
        const currentQuery = parts[parts.length - 1].trim().toLowerCase();
        if (!currentQuery) return allCountriesList.value.slice(0, 50);
        return allCountriesList.value
            .filter(c => c.toLowerCase().includes(currentQuery))
            .slice(0, 50);
    });

    const selectCanForm = (country) => {
        const parts = state.countriesThatCanForm.split(',');
        parts[parts.length - 1] = (parts.length > 1 ? ' ' : '') + country;
        state.countriesThatCanForm = parts.join(',');
        showCanFormDropdown.value = false;
    };

    const handleCanFormBlur = () => {
        setTimeout(() => showCanFormDropdown.value = false, 150);
    };


    // NATIONS REQUIRED TO FORM
    const showRequiredDropdown = ref(false);

    const filteredRequired = computed(() => {
        const parts = state.requiredNations.split(',');
        const currentQuery = parts[parts.length - 1].trim().toLowerCase();
        if (!currentQuery) return baseCountriesList.value.slice(0, 50);
        return baseCountriesList.value
            .filter(c => c.toLowerCase().includes(currentQuery))
            .slice(0, 50);
    });

    const selectRequired = (country) => {
        const parts = state.requiredNations.split(',');
        parts[parts.length - 1] = (parts.length > 1 ? ' ' : '') + country;
        state.requiredNations = parts.join(',');
        showRequiredDropdown.value = false;
    };

    const handleRequiredBlur = () => {
        setTimeout(() => showRequiredDropdown.value = false, 150);
    };

    // Update src when Swiper slide changes
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
                rotate: 10,
                stretch: 100,
                depth: 100,
                modifier: 1,
                slideShadows: true,
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
                <BFormInput v-model="state.name" :placeholder="`${state.type} Name`" :state="state.name ? null : false" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup v-if="state.type == 'Formable'" label="Demonym:" class="fw-bold">
                <BFormInput v-model="state.demonym" placeholder="Demonym" />
            </BFormGroup>
        </BCol>
        <BCol md="12" v-if="state.type === 'Formable'">
            <BFormGroup label="Flag ID:" class="fw-bold">
                <BFormInput v-model="state.flagId" placeholder="Flag ID" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Button Title:" class="fw-bold">
                <BFormInput v-model="state.buttonTitle" placeholder="Button Title" :state="state.buttonTitle ? null : false" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Button Description:" class="fw-bold">
                <BFormTextarea v-model="state.buttonDescription" placeholder="Button Description" rows="2" max-rows="8" :state="state.buttonDescription ? null : false" />
            </BFormGroup>
        </BCol>
        
        <BCol md="12">
            <BFormGroup label="Countries that can form:" class="fw-bold">
                <div class="position-relative">
                    <BFormInput v-model="state.countriesThatCanForm" placeholder="e.g. United States, Scotland, Byzantine Empire"
                        @focus="showCanFormDropdown = true" @blur="handleCanFormBlur" autocomplete="off" :state="state.countriesThatCanForm ? null : false" />

                    <BListGroup v-if="showCanFormDropdown && filteredCanForm.length > 0"
                        class="position-absolute w-100 shadow-sm mt-1"
                        style="max-height: 200px; overflow-y: auto; z-index: 1050;">
                        <BListGroupItem v-for="country in filteredCanForm" :key="country" button
                            class="d-flex align-items-center"
                            @mousedown.prevent="selectCanForm(country)">
                            <img :src="`/api/flag/${encodeURIComponent(country)}`" :alt="country" class="me-3 border bg-secondary"
                                style="width: 36px; height: 24px; object-fit: cover;" loading="lazy">
                            {{ country }}
                        </BListGroupItem>
                    </BListGroup>

                    <BListGroup v-else-if="showCanFormDropdown && filteredCanForm.length === 0"
                        class="position-absolute w-100 shadow-sm mt-1" style="z-index: 1050;">
                        <BListGroupItem disabled>
                            No matching countries found
                        </BListGroupItem>
                    </BListGroup>
                </div>
            </BFormGroup>
        </BCol>

        <BCol md="12">
            <BFormGroup label="Countries Required to Form:" class="fw-bold">
                <div class="position-relative">
                    <BFormInput v-model="state.requiredNations" placeholder="e.g. United States, Scotland, Algeria"
                        @focus="showRequiredDropdown = true" @blur="handleRequiredBlur" autocomplete="off" />

                    <BListGroup v-if="showRequiredDropdown && filteredRequired.length > 0"
                        class="position-absolute w-100 shadow-sm mt-1"
                        style="max-height: 200px; overflow-y: auto; z-index: 1050;">
                        <BListGroupItem v-for="country in filteredRequired" :key="country" button
                            class="d-flex align-items-center"
                            @mousedown.prevent="selectRequired(country)">
                            <img :src="`/api/flag/${encodeURIComponent(country)}`" :alt="country" class="me-3 border bg-secondary"
                                style="width: 36px; height: 24px; object-fit: cover;" loading="lazy">
                            {{ country }}
                        </BListGroupItem>
                    </BListGroup>

                    <BListGroup v-else-if="showRequiredDropdown && filteredRequired.length === 0"
                        class="position-absolute w-100 shadow-sm mt-1" style="z-index: 1050;">
                        <BListGroupItem disabled>
                            No matching countries found
                        </BListGroupItem>
                    </BListGroup>
                </div>
            </BFormGroup>
        </BCol>

        <BCol md="12">
            <BFormGroup label="Exclusive Formables:" class="fw-bold">
                <BFormInput v-model="state.exclusiveFormables" placeholder="Exclusive Formables (comma-separated)" />
            </BFormGroup>
        </BCol>
        
        <BCol md="4">
            <BFormGroup label="Alert Title:" class="fw-bold">
                <BFormInput v-model="state.alertTitle" placeholder="Alert Title" />
            </BFormGroup>
        </BCol>
        <BCol md="4">
            <BFormGroup label="Alert Button Text:" class="fw-bold">
                <BFormInput v-model="state.alertButton" placeholder="Ending Statement" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Alert Description:" class="fw-bold">
                <BFormTextarea v-model="state.alertDescription" placeholder="Alert Description" rows="2" max-rows="8" />
            </BFormGroup>
        </BCol>
        
        <BCol md="12">
            <BFormGroup label="Modifiers:" class="fw-bold">
                <BFormInput v-model="state.modifiers" placeholder="Modifiers (comma-separated)" />
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