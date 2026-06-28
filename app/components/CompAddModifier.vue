<!-- components/CompAddModifier.vue -->
<script setup>
    import { reactive, computed } from 'vue';

    import { FandomLists } from '~/composables/FandomLists';

    const { modifierEffectsData } = await FandomLists();

    const props = defineProps({
        modelValue: {
            type: Boolean,
            default: false
        }
    });

    const emit = defineEmits(['update:modelValue', 'add-modifier']);

    const isVisible = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue', value)
    });

    const newModForm = reactive({
        Title: '',
        Description: '',
        IconID: '',
        Effects: []
    });

    const addNewModEffect = () => {
        newModForm.Effects.push({ key: '', val: 0, unit: '%' });
    };

    const removeNewModEffect = (index) => {
        newModForm.Effects.splice(index, 1);
    };

    const handleOk = (bvModalEvent) => {
        // Prevent modal from closing if title is empty
        if (!newModForm.Title.trim()) {
            bvModalEvent.preventDefault();
            return;
        }

        const formattedEffects = {};
        newModForm.Effects.forEach(e => {
            if (e.key && e.val) {
                formattedEffects[e.key] = [Number(e.val), e.unit];
            }
        });

        const parsedIconMatch = newModForm.IconID.match(/\d+/);
        const parsedIcon = parsedIconMatch ? parsedIconMatch[0] : '';

        const newModifier = {
            type: 'new',
            Title: newModForm.Title,
            Description: newModForm.Description,
            IconID: parsedIcon,
            Effects: formattedEffects,
            length: '',
            infinite: false,
            DoNotClear: false
        };

        emit('add-modifier', newModifier);

        // Reset form for next time
        newModForm.Title = '';
        newModForm.Description = '';
        newModForm.IconID = '';
        newModForm.Effects = [];
    };

    // --- Effect Autocomplete Logic ---
    // Extract the keys from the nested object
    const availableEffects = computed(() => {
        const data = modifierEffectsData.value?.modifiereffectsdata || {};
        return Object.keys(data);
    });

    const getFilteredEffects = (query) => {
        const q = (query || '').toLowerCase().trim();
        const effectsList = availableEffects.value;

        if (!q) return effectsList.slice(0, 50);
        return effectsList.filter(r => r.toLowerCase().includes(q)).slice(0, 50);
    };

    const selectEffect = (entry, selectedSuggestion) => {
        entry.key = selectedSuggestion;

        // Auto-fill the unit format based on Lua data
        const effectInfo = modifierEffectsData.value?.modifiereffectsdata?.[selectedSuggestion];
        if (effectInfo && effectInfo.format) {
            entry.unit = effectInfo.format;
        }

        entry._showDropdown = false;
    };

    const hideEffectDropdown = (entry) => {
        // Delay hiding so the click event on the list item has time to fire
        setTimeout(() => { entry._showDropdown = false; }, 150);
    };

    // Effect format logic
    const getUnitOptions = (effectKey) => {
        // Look up the format for the currently selected effect
        const format = modifierEffectsData.value?.modifiereffectsdata?.[effectKey]?.format;

        if (format === '%') {
            return ['%', 'x'];
        } else if (format === 'Base') {
            return ['Base'];
        } else {
            // Fallback if no format is found
            return ['%', 'Base', 'x'];
        }
    };
</script>

<template>
    <BModal v-model="isVisible" title="Create Custom Modifier" @ok="handleOk" cancel-variant="red"
        ok-title="Add Modifier" ok-variant="green" size="lg">
        <BFormGroup label="Modifier Title:" class="fw-bold mb-3">
            <BFormInput v-model="newModForm.Title" placeholder="e.g. A Place Where Anything Abounds" />
        </BFormGroup>

        <BFormGroup label="Description:" class="fw-bold mb-3">
            <BFormTextarea v-model="newModForm.Description" placeholder="Description" rows="2" />
        </BFormGroup>

        <BFormGroup label="Roblox Icon ID or URL:" class="fw-bold mb-3">
            <BFormInput v-model="newModForm.IconID" placeholder="e.g. 78706150424195" />
        </BFormGroup>

        <hr />

        <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold">Effects Details</span>
            <BButton size="sm" variant="outline-green" @click="addNewModEffect">+ Add Effect</BButton>
        </div>

        <BRow v-for="(effect, index) in newModForm.Effects" :key="index" class="mb-2 g-2 align-items-center">
            <BCol md="5">

                <BFormGroup class="fw-bold mb-0">
                    <div class="position-relative w-100" size="sm">
                        <BFormInput type="text" v-model="effect.key"
                            style="outline: none; background: transparent; color: inherit;"
                            placeholder="e.g. Tax Income, Political Power Gain" @focus="effect._showDropdown = true"
                            @blur="hideEffectDropdown(effect)" size="sm" />

                        <BListGroup v-if="effect._showDropdown" class="position-absolute w-100 shadow-sm mt-1"
                            style="max-height: 200px; overflow-y: auto; z-index: 1050; top: 100%; left: 0;">

                            <BListGroupItem v-for="suggestion in getFilteredEffects(effect.key)" :key="suggestion"
                                button class="d-flex align-items-center p-2"
                                @mousedown.prevent="selectEffect(effect, suggestion)" size="sm">
                                {{ suggestion }}
                            </BListGroupItem>

                            <BListGroupItem v-if="getFilteredEffects(effect.key).length === 0" disabled>
                                No matching effects found
                            </BListGroupItem>

                        </BListGroup>
                    </div>
                </BFormGroup>
            </BCol>
            <BCol md="3">
                <BFormInput type="number" v-model="effect.val" placeholder="Value" size="sm" />
            </BCol>
            <BCol md="3">
                <BFormSelect v-model="effect.unit" :options="getUnitOptions(effect.key)" size="sm" />
            </BCol>
            <BCol md="1" class="text-end">
                <BButton variant="outline-red" size="sm" @click="removeNewModEffect(index)">X</BButton>
            </BCol>
        </BRow>

        <div v-if="newModForm.Effects.length === 0" class="text-muted small">
            No stats added. Click "+ Add Effect" to configure buffs/debuffs.
        </div>
    </BModal>
</template>