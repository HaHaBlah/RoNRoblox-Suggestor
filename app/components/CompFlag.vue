<!-- components/CompFlag.vue -->
<script setup lang="ts">
  import type { FlagSpec } from '~/composables/useDynFlagger'
  import type { ButtonVariant } from 'bootstrap-vue-next'

  import unknownFlag from '~/assets/images/Unknown Flag.png'

  export interface LawEntry { Name: string; Types: Record<string, string> }

  const props = defineProps<{
    flag: FlagSpec;
    index: number;
    lawnames: Record<string, LawEntry>;
    errors?: { missingName: boolean; missingId: boolean };
  }>()
  const emit = defineEmits<{ remove: [index: number] }>()

  const isExpanded = ref(true)
  const thumbnailSrc = ref(unknownFlag)
  const imageInputRaw = ref(props.flag.FlagID)

  let imageAbortController: AbortController | null = null
  let imageDebounceTimer: ReturnType<typeof setTimeout> | null = null
  let thumbnailAbortController: AbortController | null = null
  let thumbnailRetryTimer: ReturnType<typeof setTimeout> | null = null

  async function loadThumbnail(id: string, isRetry = false) {
    if (!id) {
      thumbnailSrc.value = unknownFlag
      return
    }

    thumbnailAbortController?.abort()
    thumbnailAbortController = new AbortController()
    const { signal } = thumbnailAbortController

    try {
      const data = await $fetch<{ imageUrl: string; state?: string; retry?: boolean }>(
        `/api/roblox-thumbnail?assetid=${encodeURIComponent(id)}&size=700x700`,
        { signal }
      )
      if (data && data.imageUrl) {
        thumbnailSrc.value = data.imageUrl
      } else if (!isRetry && data?.retry) {
        if (thumbnailRetryTimer) clearTimeout(thumbnailRetryTimer)
        thumbnailRetryTimer = setTimeout(() => {
          if (props.flag.FlagID === id) {
            loadThumbnail(id, true)
          }
        }, 1500)
      } else {
        thumbnailSrc.value = unknownFlag
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      if (!isRetry) {
        if (thumbnailRetryTimer) clearTimeout(thumbnailRetryTimer)
        thumbnailRetryTimer = setTimeout(() => {
          if (props.flag.FlagID === id) {
            loadThumbnail(id, true)
          }
        }, 1500)
      } else {
        thumbnailSrc.value = unknownFlag
      }
    }
  }

  // Watch FlagID to load thumbnails
  watch(
    () => props.flag.FlagID,
    (id) => {
      if (thumbnailRetryTimer) clearTimeout(thumbnailRetryTimer)
      loadThumbnail(id)
    },
    { immediate: true },
  )

  // Keeps the local input ref synced with the parent prop
  watch(
    () => props.flag.FlagID,
    (newId) => {
      const match = imageInputRaw.value.trim().match(/\d+/)
      const currentParsed = match ? match[0] : imageInputRaw.value

      // Only update if it doesn't match the current parsed input to prevent overwriting mid-typing
      if (newId !== currentParsed) {
        imageInputRaw.value = newId
      }
    }
  )

  function onImageInput(value: string | number | null) {
    const strVal = String(value ?? '')
    imageInputRaw.value = strVal

    const match = strVal.trim().match(/\d+/)
    if (!match) {
      props.flag.FlagID = ''
      thumbnailSrc.value = unknownFlag
      return
    }
    const parsed = match[0]
    // Immediately set parsed ID so input isn't blanked and thumbnail loading starts right away
    props.flag.FlagID = parsed

    if (imageDebounceTimer) clearTimeout(imageDebounceTimer)
    imageDebounceTimer = setTimeout(async () => {
      imageAbortController?.abort()
      imageAbortController = new AbortController()
      const { signal } = imageAbortController

      try {
        const data = await $fetch<{ imageId: string }>(
          `/api/roblox-decal?decalid=${encodeURIComponent(parsed)}`,
          { signal }
        )
        if (data && data.imageId) {
          props.flag.FlagID = data.imageId
        }
      } catch (err: unknown) {
        if (err instanceof Error && (err.name === 'AbortError' || (err.cause as Error)?.name === 'AbortError')) return
        props.flag.FlagID = parsed
      }
    }, 300)
  }


  function toggleIdeology(ideology: string) {
    const idx = props.flag.Ideologies.indexOf(ideology)
    if (idx !== -1) props.flag.Ideologies.splice(idx, 1)
    else props.flag.Ideologies.push(ideology)
  }

  // Returns Bootstrap variants instead of CSS classes
  function ideologyVariant(ideology: string): ButtonVariant {
    if (props.flag.Ideologies.length === 0) {
      return 'yellow';
    }

    // If not empty, check for the specific ideology
    return props.flag.Ideologies.includes(ideology) ? 'green' : 'red';
  }

  const sortedLaws = computed(() => Object.entries(props.lawnames || {}).sort(([, a], [, b]) => a.Name.localeCompare(b.Name)))
  const selectedLawCode = ref<string | null>(null)
  const selectedLawName = computed(() => selectedLawCode.value ? (props.lawnames?.[selectedLawCode.value]?.Name ?? '') : '')
  const selectedLawTypes = computed<Record<string, string>>(() => selectedLawCode.value ? (props.lawnames?.[selectedLawCode.value]?.Types ?? {}) : {})

  function selectLaw(code: string) { selectedLawCode.value = code }

  function lawSelectionVariant(code: string): ButtonVariant {
    const hasLaws = (props.flag.Laws[code]?.length ?? 0) > 0
    const hasNotLaws = (props.flag.NOTLaws[code]?.length ?? 0) > 0

    if (hasLaws && hasNotLaws) return 'mixed'

    if (hasLaws) return 'green'
    if (hasNotLaws) return 'red'

    return 'yellow'
  }

  function toggleLawLevel(levelKey: string) {
    const code = selectedLawCode.value
    if (!code) return
    if (!props.flag.Laws[code]) props.flag.Laws[code] = []
    if (!props.flag.NOTLaws[code]) props.flag.NOTLaws[code] = []
    const lawArr = props.flag.Laws[code]!
    const notLawArr = props.flag.NOTLaws[code]!

    if (lawArr.includes(levelKey)) {
      lawArr.splice(lawArr.indexOf(levelKey), 1)
      notLawArr.push(levelKey)
    } else if (notLawArr.includes(levelKey)) {
      notLawArr.splice(notLawArr.indexOf(levelKey), 1)
    } else {
      lawArr.push(levelKey)
    }
    if (!lawArr.length) delete props.flag.Laws[code]
    if (!notLawArr.length) delete props.flag.NOTLaws[code]
  }

  function levelVariant(levelKey: string): ButtonVariant {
    const code = selectedLawCode.value
    // Changed to 'yellow'
    if (!code) return 'yellow'

    const lawArr = props.flag.Laws[code] ?? []
    const notLawArr = props.flag.NOTLaws[code] ?? []
    if (lawArr.includes(levelKey)) return 'green'
    if (notLawArr.includes(levelKey)) return 'red'
    if (lawArr.length) return 'red'

    // Changed to 'yellow'
    return 'yellow'
  }

  function getLawName(code: string): string { return props.lawnames?.[code]?.Name ?? code }
  function getLevelText(code: string, key: string): string { return props.lawnames?.[code]?.Types?.[key] ?? key }
  function formatLawsObj(obj: Record<string, string[]>): string {
    return Object.entries(obj).filter(([, v]) => v?.length).map(([code, levels]) => `${getLawName(code)}: ${levels.map(l => getLevelText(code, l)).join(', ')}`).join(' | ') || 'None'
  }

  const overviewLawsText = computed(() => formatLawsObj(props.flag.Laws))
  const overviewNotLawsText = computed(() => formatLawsObj(props.flag.NOTLaws))
</script>

<template>
  <BCard no-body class="mb-4 border-yellow rounded-0">
    <!-- Collapse Header / Overview -->
    <BCardHeader class="p-0 bg-grey-active bg-opacity-10 hover-overlay">
      <BButton variant="link" class="w-100 text-decoration-none text-start d-flex flex-wrap p-3"
        @click="isExpanded = !isExpanded">
        <div class="d-flex align-items-center me-4">
          <img :src="thumbnailSrc" alt="Flag thumbnail" class="border bg-white" style="width: 120px; height: auto;" />
          <h5 class="ms-3 mb-0">{{ flag.FlagName || 'Flag Name' }}</h5>
        </div>
        <div class="flex-grow-1 small mt-2 mt-md-0">
          <div><strong class="text-muted">Flag ID:</strong> {{ flag.FlagID }}</div>
          <div><strong class="text-muted">Ideologies:</strong> {{ flag.Ideologies.join(', ') || 'None' }}</div>
          <div><strong class="text-green">Laws:</strong> {{ overviewLawsText }}</div>
          <div><strong class="text-red">NOT Laws:</strong> {{ overviewNotLawsText }}</div>
        </div>
      </BButton>
    </BCardHeader>

    <!-- Flag Contents -->
    <BCollapse v-model="isExpanded">
      <BCardBody class="position-relative p-2 p-md-3">
        <BButton variant="red" size="sm" class="position-absolute top-0 end-0 m-3 z-3" @click="emit('remove', index)">
          Delete Flag
        </BButton>

        <BRow class="g-3 mb-4">
          <BCol md="6">
            <BFormGroup label="Name:" class="fw-bold">
              <BFormInput v-model="flag.FlagName" :state="errors?.missingName ? false : null"
                placeholder="Input Flag Name here" />
              <BFormInvalidFeedback>Flag Name is required.</BFormInvalidFeedback>
            </BFormGroup>
          </BCol>
          <BCol md="6">
            <BFormGroup label="Image ID:" class="fw-bold">
              <BFormInput :model-value="imageInputRaw" :state="errors?.missingId ? false : null"
                placeholder="Input Decal/Image ID here" @update:model-value="onImageInput" />
              <BFormInvalidFeedback>Image ID is required.</BFormInvalidFeedback>
            </BFormGroup>
          </BCol>
          <BCol cols="12">
            <BFormGroup label="Description/Sources:" class="fw-bold">
              <BFormTextarea v-model="flag.Description" placeholder="Input Flag Description here" rows="2"
                max-rows="8" />
            </BFormGroup>
          </BCol>
        </BRow>

        <!-- Ideologies Tree -->
        <div class="mb-4">
          <h6 class="fw-bold mb-2 text-center">Ideologies</h6>
          <CompIdeologyTree
            :selected-ideologies="flag.Ideologies"
            @toggle="toggleIdeology"
          />
        </div>

        <!-- Laws -->
        <div class="border-top pt-3">
          <h6 class="fw-bold mb-2 text-center">Laws</h6>
          <div v-if="!sortedLaws.length" class="text-center py-3">
            <BSpinner label="Loading Laws..."></BSpinner>
          </div>
          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <BButton class="ron-button" v-for="[code, law] in sortedLaws" :key="code" size="sm"
              :variant="lawSelectionVariant(code)" @click="selectLaw(code)">
              {{ law.Name }}
            </BButton>
          </div>

          <!-- Selected Law Options -->
          <div v-if="selectedLawName" class="mt-4 border-top pt-3 text-center">
            <h6 class="fw-bold mb-2">{{ selectedLawName }}</h6>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <BButton class="ron-button" v-for="(levelText, levelKey) in selectedLawTypes" :key="levelKey" size="sm"
                :variant="levelVariant(String(levelKey))" @click="toggleLawLevel(String(levelKey))">
                {{ levelText }}
              </BButton>
            </div>
          </div>
        </div>
      </BCardBody>
    </BCollapse>
  </BCard>
</template>

<style scoped>
  .ideology-btn {
    min-width: 8em;
  }

  @media (max-width: 576px) {
    .ideology-btn {
      min-width: 7em;
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
    }
  }


  /* Ideology colours */
  .ideology-socialism button {
    color: #F3B6B6;
  }

  .ideology-communism button {
    color: #F37B7B;
  }

  .ideology-liberalism button {
    color: #B5B6F3;
  }

  .ideology-democracy button {
    color: #7B7BF3;
  }

  .ideology-nationalism button {
    color: #B8B8B9;
  }

  .ideology-fascism button {
    color: #7B7B7B;
  }


</style>
