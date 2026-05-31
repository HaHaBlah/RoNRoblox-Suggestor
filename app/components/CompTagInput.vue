<!-- components/CompTagInput.vue -->
<script setup>
    import { ref, computed } from 'vue';

    const props = defineProps({
        modelValue: {
            type: Array,
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        placeholder: {
            type: String,
            default: 'Type to search...'
        },
        emptyMessage: {
            type: String,
            default: 'No matching items found'
        }
    });

    const emit = defineEmits(['update:modelValue']);

    const showDropdown = ref(false);
    const inputValue = ref('');

    const filteredOptions = computed(() => {
        const currentQuery = inputValue.value.trim().toLowerCase();

        // Filter out already selected items
        const available = props.options.filter(
            c => !props.modelValue.includes(c)
        );

        if (!currentQuery) return available.slice(0, 50);
        return available
            .filter(c => c.toLowerCase().includes(currentQuery))
            .slice(0, 50);
    });

    const addItem = (item) => {
        if (!item) return;
        if (!props.modelValue.includes(item)) {
            emit('update:modelValue', [...props.modelValue, item]);
        }
        inputValue.value = '';
        showDropdown.value = true;
    };

    const removeItem = (index) => {
        const newArray = [...props.modelValue];
        newArray.splice(index, 1);
        emit('update:modelValue', newArray);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = inputValue.value.trim();
            if (val) {
                const exactMatch = filteredOptions.value.find(c => c.toLowerCase() === val.toLowerCase());
                addItem(exactMatch || val);
            }
        } else if (e.key === 'Backspace' && !inputValue.value) {
            if (props.modelValue.length > 0) {
                const newArray = [...props.modelValue];
                newArray.pop();
                emit('update:modelValue', newArray);
            }
        }
    };

    const handleBlur = () => {
        setTimeout(() => showDropdown.value = false, 150);
    };
</script>

<template>
    <div class="form-control d-flex flex-wrap align-items-center gap-2"
        :class="{ 'is-invalid': modelValue.length === 0 }">
        <slot name="chip" v-for="(item, idx) in modelValue" :key="idx" :item="item" :remove="() => removeItem(idx)">
            <span class="badge bg-primary d-flex align-items-center py-1 ps-1 pe-2" style="font-size: 0.85rem;">
                <img :src="`/api/flag/${encodeURIComponent(item)}`" :alt="item" class="me-2 border bg-ron-button-dark"
                    style="width: 24px; height: 16px; object-fit: cover;" loading="lazy">
                {{ item }}
                <button type="button" class="btn-close btn-close-white ms-2" style="font-size: 0.5em;"
                    @click.stop="removeItem(idx)" aria-label="Remove"></button>
            </span>
        </slot>

        <input type="text" class="border-0 flex-grow-1"
            style="outline: none; min-width: 150px; background: transparent; color: inherit;" v-model="inputValue"
            :placeholder="placeholder" @focus="showDropdown = true" @blur="handleBlur" @keydown="handleKeyDown"
            autocomplete="off" />
    </div>

    <div class="position-relative">
        <BListGroup v-if="showDropdown && filteredOptions.length > 0" class="position-absolute w-100 shadow-sm mt-1"
            style="max-height: 200px; overflow-y: auto; z-index: 1050;">
            <BListGroupItem v-for="item in filteredOptions" :key="item" button class="d-flex align-items-center"
                @mousedown.prevent="addItem(item)">
                <slot name="dropdown-item" :item="item">
                    <img :src="`/api/flag/${encodeURIComponent(item)}`" :alt="item"
                        class="me-3 border bg-ron-button-dark" style="width: 36px; height: 24px; object-fit: cover;"
                        loading="lazy">
                    {{ item }}
                </slot>
            </BListGroupItem>
        </BListGroup>

        <BListGroup v-else-if="showDropdown && filteredOptions.length === 0"
            class="position-absolute w-100 shadow-sm mt-1" style="z-index: 1050;">
            <BListGroupItem disabled>
                {{ emptyMessage }}
            </BListGroupItem>
        </BListGroup>
    </div>
</template>