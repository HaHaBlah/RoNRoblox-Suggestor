<!-- components/CompParamsDyn-Flagger.vue -->
<script setup lang="ts">
  import { useDynFlagger } from '~/composables/useDynFlagger'
  import { useFlagUrl } from '~/composables/useFlagUrl'

  const { state, addFlag, removeFlag } = useDynFlagger()
  const { getFlagData } = useFlagUrl()

  interface LawEntry { Name: string; Types: Record<string, string> }
  interface FandomData {
    Lawnames: { lawNames: Record<string, LawEntry> }
  }

  const { data: fandomData } = await useFetch<FandomData>('/api/fandom-data')
  const lawnames = computed(() => fandomData.value?.Lawnames?.lawNames ?? {})

  const nationFlagSrc = ref('Unknown Flag.png')
  let nationFlagController: AbortController | null = null

  watch(
    () => state.NationName,
    async (name) => {
      nationFlagController?.abort()
      nationFlagController = new AbortController()

      if (!name) {
        nationFlagSrc.value = 'Unknown Flag.png'
        return
      }

      try {
        const url = await getFlagData(name)
        if (!nationFlagController.signal.aborted) {
          nationFlagSrc.value = url || 'Unknown Flag.png'
        }
      } catch {
        if (!nationFlagController.signal.aborted) {
          nationFlagSrc.value = 'Unknown Flag.png'
        }
      }
    },
  )

  const mobileRailOpen = ref(false)

  onMounted(() => {
    if (state.Flags.length === 0) addFlag()
  })
</script>

<template>
  <BContainer fluid class="py-3">
    <!-- Mobile Offcanvas Sidebar -->
    <BOffcanvas v-model="mobileRailOpen" title="Select Nation" placement="start">
      <CompNationsList @select="name => {
        state.NationName = name
        mobileRailOpen = false
      }" />
    </BOffcanvas>

    <BRow>
      <!-- Desktop Sidebar -->
      <BCol lg="3" class="d-none d-lg-block border-end">
        <CompNationsList @select="name => state.NationName = name" />
      </BCol>

      <!-- Main Content -->
      <BCol lg="9" cols="12">
        <!-- Mobile Sidebar Toggle -->
        <BButton variant="outline-primary" class="d-lg-none mb-3 w-100" @click="mobileRailOpen = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Select Nation
        </BButton>

        <!-- Nation Overview -->
        <div class="text-center mb-4">
          <img :src="nationFlagSrc" alt="Nation flag" class="img-fluid rounded mb-3 shadow-sm" style="max-height: 150px;">
          <BFormGroup label="Nation name:" label-for="nation-name" class="fw-bold mx-auto" style="max-width: 400px;">
            <BFormInput id="nation-name" v-model="state.NationName" placeholder="Click a country on the left or write here" />
          </BFormGroup>
        </div>

        <!-- Flag Cards -->
        <CompFlag v-for="(flag, i) in state.Flags" :key="i" :flag="flag" :index="i" :lawnames="lawnames" @remove="removeFlag" />

        <!-- Add Flag Button -->
        <div class="text-center my-4">
          <BButton variant="outline-success" size="lg" @click="addFlag()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="me-2">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="3" />
            </svg>
            Add New Flag
          </BButton>
        </div>

        <!-- Output Component -->
        <CompOutput />
      </BCol>
    </BRow>
  </BContainer>
</template>