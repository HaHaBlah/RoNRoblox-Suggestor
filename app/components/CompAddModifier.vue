<!-- components/CompAddModifier.vue -->
<script setup>
    import { reactive, computed } from 'vue';

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
                <BFormInput v-model="effect.key" placeholder="e.g. Tax Income, Politcal Power Gain" size="sm" />
            </BCol>
            <BCol md="3">
                <BFormInput type="number" v-model="effect.val" placeholder="Value" size="sm" />
            </BCol>
            <BCol md="3">
                <BFormSelect v-model="effect.unit" :options="['%', 'Base', 'x']" size="sm" />
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