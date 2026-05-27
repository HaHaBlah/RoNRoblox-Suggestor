<!-- components/CompParamsDyn-Flagger.vue -->
<script setup lang="ts">
  import { useDynFlagger } from '~/composables/useDynFlagger'
  import { useDynFlaggerOutput } from '~/composables/useDynFlaggerOutput'
  import { useFlagUrl } from '~/composables/useFlagUrl'

  import unknownFlag from '~/assets/images/Unknown Flag.png'

  const { state, addFlag, removeFlag } = useDynFlagger()
  const { outputText, validation } = useDynFlaggerOutput()
  const { getFlagData } = useFlagUrl()

  interface LawEntry { Name: string; Types: Record<string, string> }
  interface FandomData {
    Lawnames: { lawNames: Record<string, LawEntry> }
  }

  const { data: fandomData } = await useFetch<FandomData>('/api/fandom-data')
  const lawnames = computed(() => fandomData.value?.Lawnames?.lawNames ?? {})

  const nationFlagSrc = ref(unknownFlag)
  let nationFlagController: AbortController | null = null

  watch(
    () => state.NationName,
    async (name) => {
      nationFlagController?.abort()
      nationFlagController = new AbortController()

      if (!name) {
        nationFlagSrc.value = unknownFlag
        return
      }

      try {
        const url = await getFlagData(name)
        if (!nationFlagController.signal.aborted) {
          // If getFlagData fails or returns empty, use unknown flag
          nationFlagSrc.value = url || unknownFlag
        }
      } catch {
        if (!nationFlagController.signal.aborted) {
          nationFlagSrc.value = unknownFlag
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
    <!-- Mobile Rail -->
    <BOffcanvas v-model="mobileRailOpen" title="Select Nation" placement="start">
      <CompNationsList @select="name => {
        state.NationName = name
        mobileRailOpen = false
      }" />
    </BOffcanvas>


    <BRow>
      <!-- Desktop Rail -->
      <BCol lg="3" class="d-none d-lg-block border-end">
        <div class="sticky-top" style="top: 1rem; height: calc(100vh - 2rem);">
          <CompNationsList @select="name => state.NationName = name" />
        </div>
      </BCol>

      <!-- Main Content -->
      <BCol lg="9" cols="12">
        <BButton variant="outline-primary" class="d-lg-none mb-3 w-100" @click="mobileRailOpen = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            class="me-2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Select Nation
        </BButton>

        <div class="text-center mb-4">
          <img :src="nationFlagSrc" alt="Nation flag" class="img-fluid mb-3 shadow-sm" style="max-height: 150px;" />
          <BFormGroup label="Nation name:" label-for="nation-name" class="fw-bold mx-auto" style="max-width: 400px;">
            <BFormInput id="nation-name" v-model="state.NationName" :state="validation.isNationMissing ? false : null"
              placeholder="Click a country on the left or write here" />
            <BFormInvalidFeedback>Nation Name is required.</BFormInvalidFeedback>
          </BFormGroup>
        </div>

        <CompFlag v-for="(flag, i) in state.Flags" :key="flag._id" :flag="flag" :index="i" :lawnames="lawnames"
          :errors="validation.flagErrors[i]" @remove="removeFlag" />

        <div class="text-center my-4">
          <BButton variant="green" size="lg" @click="addFlag()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="me-2">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="3" />
            </svg>
            Add New Flag
          </BButton>
        </div>

        <CompOutput :content="outputText">
          <div v-if="validation.hasErrors" class="text-danger pt-2">
            <h6 class="fw-bold mb-3">Missing required inputs:</h6>
            <ul class="mb-0 text-start d-inline-block">
              <li v-for="(error, idx) in validation.errors" :key="idx">{{ error }}</li>
            </ul>
          </div>
          <div v-else>
            Please input the Nation Name and fill out all flag names and image IDs.
          </div>
        </CompOutput>
      </BCol>
    </BRow>
  </BContainer>
</template>