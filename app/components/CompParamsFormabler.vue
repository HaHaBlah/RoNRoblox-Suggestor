<!-- CompParamsFormabler.vue -->
<script setup>
    import { computed, ref } from 'vue';

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

    // Swiper modules
    const modules = [EffectCoverflow, Pagination, Navigation];

    // Mock data for flags 
    const availableFlags = ref([
        { id: 'unknown', src: unknownFlag, name: 'Unknown Flag' },
        { id: 'abstract_1', src: 'https://swiperjs.com/demos/images/abstract-1.jpg', name: 'Flag 1' },
        { id: 'abstract_2', src: 'https://swiperjs.com/demos/images/abstract-2.jpg', name: 'Flag 2' },
        { id: 'abstract_3', src: 'https://swiperjs.com/demos/images/abstract-3.jpg', name: 'Flag 3' },
    ]);

    const formableType = ref('Formable');

    // Toggle between 'Formable' and 'Mission'
    const toggleFormableType = () => {
        formableType.value = formableType.value === 'Formable' ? 'Mission' : 'Formable';
    };

    // State variables
    const nationFlagSrc = ref(availableFlags.value[0].src);
    const FormableName = ref('');
    const Demonym = ref('');
    const FlagID = ref('');
    const ButtonTitle = ref('');
    const ButtonDescription = ref('');
    const AlertTitle = ref('');
    const AlertDescription = ref('');
    const CountriesThatCanForm = ref('');
    const RequiredTerritory = ref('');
    const ExclusiveFormables = ref('');
    const Modifiers = ref('');

    // --- AUTOCOMPLETE LOGIC START ---
    const showCountriesDropdown = ref(false);

    // Fetch the fandom data
    const { data: fandomData } = await useFetch('/api/fandom-data');

    // Combine Nations, Releasables, and Formables into one master list
    const allCountriesList = computed(() => {
        if (!fandomData.value) return [];

        const nations = Object.entries(fandomData.value.Nationdata.nationdata)
            .filter(([, v]) => v.nation === true).map(([k]) => k);
        const releasables = Object.entries(fandomData.value.Nationdata.nationdata)
            .filter(([, v]) => v.nation === false).map(([k]) => k);
        const formables = Object.values(fandomData.value.Tagdata.Tags)
            .filter(f => f.FormableName && !f.Removed).map(f => f.FormableName);

        // Use a Set to remove any accidental duplicates, then sort alphabetically
        return [...new Set([...nations, ...releasables, ...formables])].sort();
    });

    // Filter logic that respects comma-separated values
    const filteredCountries = computed(() => {
        // Split by comma to get the *current* word the user is typing
        const parts = CountriesThatCanForm.value.split(',');
        const currentQuery = parts[parts.length - 1].trim().toLowerCase();

        // If they haven't typed anything after the comma, show the top 50
        if (!currentQuery) return allCountriesList.value.slice(0, 50);

        // Filter based on the current query, limited to 50 for performance
        return allCountriesList.value
            .filter(c => c.toLowerCase().includes(currentQuery))
            .slice(0, 50);
    });

    // Append the selected country to the comma-separated list
    const selectCountry = (country) => {
        const parts = CountriesThatCanForm.value.split(',');
        parts[parts.length - 1] = (parts.length > 1 ? ' ' : '') + country;
        CountriesThatCanForm.value = parts.join(',');
        showCountriesDropdown.value = false;
    };

    const handleCountryBlur = () => {
        setTimeout(() => {
            showCountriesDropdown.value = false;
        }, 150);
    };
    // --- AUTOCOMPLETE LOGIC END ---

    // Update src when Swiper slide changes
    const onSlideChange = (swiper) => {
        const selectedFlag = availableFlags.value[swiper.activeIndex];
        if (selectedFlag) {
            nationFlagSrc.value = selectedFlag.src;
        }
    };
</script>

<template>
    <h1>Warning, This Page is a Work In Progress. Does not work.</h1>
    <div class="text-center mb-4">
        <BButton variant="primary" class="mb-3" @click="toggleFormableType">
            {{ formableType }}
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
                <img :src="flag.src" :alt="`${formableType} Flag - ${flag.name}`" style="max-height: 150px;" />
            </swiper-slide>
        </swiper>
    </div>

    <BRow>
        <BCol md="12">
            <BFormGroup :label="`${formableType} Name:`" class="fw-bold">
                <BFormInput v-model="FormableName" :placeholder="`${formableType} Name`" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup v-if="formableType == 'Formable'" label="Demonym:" class="fw-bold">
                <BFormInput v-model="Demonym" placeholder="Demonym" />
            </BFormGroup>
        </BCol>
        <BCol md="12" v-if="formableType === 'Formable'">
            <BFormGroup label="Flag ID:" class="fw-bold">
                <BFormInput v-model="FlagID" placeholder="Flag ID" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Button Title:" class="fw-bold">
                <BFormInput v-model="ButtonTitle" placeholder="Button Title" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Button Description:" class="fw-bold">
                <BFormTextarea v-model="ButtonDescription" placeholder="Button Description" rows="2" max-rows="8" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Alert Title:" class="fw-bold">
                <BFormInput v-model="AlertTitle" placeholder="Alert Title" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Alert Description:" class="fw-bold">
                <BFormTextarea v-model="AlertDescription" placeholder="Alert Description" rows="2" max-rows="8" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Countries that can form:" class="fw-bold">
                <div class="position-relative">
                    <BFormInput v-model="CountriesThatCanForm" placeholder="e.g. England, France, Spain"
                        @focus="showCountriesDropdown = true" @blur="handleCountryBlur" autocomplete="off" />

                    <BListGroup v-if="showCountriesDropdown && filteredCountries.length > 0"
                        class="position-absolute w-100 shadow-sm mt-1"
                        style="max-height: 200px; overflow-y: auto; z-index: 1050;">
                        <BListGroupItem v-for="country in filteredCountries" :key="country" button
                            @mousedown.prevent="selectCountry(country)">
                            {{ country }}
                        </BListGroupItem>
                    </BListGroup>

                    <BListGroup v-else-if="showCountriesDropdown && filteredCountries.length === 0"
                        class="position-absolute w-100 shadow-sm mt-1" style="z-index: 1050;">
                        <BListGroupItem disabled>
                            No matching countries found
                        </BListGroupItem>
                    </BListGroup>
                </div>
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Required Territory:" class="fw-bold">
                <BFormInput v-model="RequiredTerritory" placeholder="Required Territory" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Exclusive Formables:" class="fw-bold">
                <BFormInput v-model="ExclusiveFormables" placeholder="Exclusive Formables" />
            </BFormGroup>
        </BCol>
        <BCol md="12">
            <BFormGroup label="Modifiers:" class="fw-bold">
                <BFormInput v-model="Modifiers" placeholder="Modifiers" />
            </BFormGroup>
        </BCol>
    </BRow>

    <CompOutput>Please input the {{ formableType }} Name and other required fields.</CompOutput>
</template>

<style scoped>

    /* Optional: Scope Swiper sizing so it doesn't take up the whole screen */
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