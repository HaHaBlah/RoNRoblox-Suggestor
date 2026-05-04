<!-- components/CompFlag.vue -->
<script setup lang="ts">
  import type { FlagSpec } from '~/composables/useDynFlagger'

  export interface LawEntry { Name: string; Types: Record<string, string> }

  const props = defineProps<{ flag: FlagSpec; index: number; lawnames: Record<string, LawEntry> }>()
  const emit = defineEmits<{ remove: [index: number] }>()

  const isExpanded = ref(true)
  const thumbnailSrc = ref('Unknown Flag.png')

  watch(
    () => props.flag.FlagID,
    async (id) => {
      if (!id) { thumbnailSrc.value = 'Unknown Flag.png'; return }
      try {
        const data = await $fetch<{ imageUrl: string }>(`/api/roblox-thumbnail?assetid=${encodeURIComponent(id)}&size=700x700`)
        thumbnailSrc.value = data.imageUrl
      } catch {
        thumbnailSrc.value = 'Unknown Flag.png'
      }
    },
    { immediate: true },
  )

  const imageInputRaw = ref(props.flag.FlagID)
  let imageAbortController: AbortController | null = null

  async function onImageInput(value: string) {
    imageInputRaw.value = value
    imageAbortController?.abort()
    imageAbortController = new AbortController()
    const { signal } = imageAbortController
    props.flag.FlagID = ''

    const match = value.trim().match(/\d+/)
    if (!match) return
    const parsed = match[0]

    try {
      const data = await $fetch<{ imageId: string }>(`/api/roblox-decal?decalid=${encodeURIComponent(parsed)}`, { signal } as RequestInit)
      props.flag.FlagID = data.imageId
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || (err.cause as Error)?.name === 'AbortError')) return
      props.flag.FlagID = parsed
    }
  }

  function toggleIdeology(ideology: string) {
    const idx = props.flag.Ideologies.indexOf(ideology)
    if (idx !== -1) props.flag.Ideologies.splice(idx, 1)
    else props.flag.Ideologies.push(ideology)
  }

  // Returns Bootstrap variants instead of CSS classes
  function ideologyVariant(ideology: string): string {
    if (!props.flag.Ideologies.length) return 'outline-secondary'
    return props.flag.Ideologies.includes(ideology) ? 'success' : 'danger'
  }

  const sortedLaws = computed(() => Object.entries(props.lawnames).sort(([, a], [, b]) => a.Name.localeCompare(b.Name)))
  const selectedLawCode = ref<string | null>(null)
  const selectedLawName = computed(() => selectedLawCode.value ? (props.lawnames[selectedLawCode.value]?.Name ?? '') : '')
  const selectedLawTypes = computed<Record<string, string>>(() => selectedLawCode.value ? (props.lawnames[selectedLawCode.value]?.Types ?? {}) : {})

  function selectLaw(code: string) { selectedLawCode.value = code }

  function lawSelectionVariant(code: string): string {
    const hasLaws = (props.flag.Laws[code]?.length ?? 0) > 0
    const hasNotLaws = (props.flag.NOTLaws[code]?.length ?? 0) > 0
    if (hasLaws && hasNotLaws) return 'warning'
    if (hasLaws) return 'success'
    if (hasNotLaws) return 'danger'
    return 'outline-secondary'
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

  function levelVariant(levelKey: string): string {
    const code = selectedLawCode.value
    if (!code) return 'outline-secondary'
    const lawArr = props.flag.Laws[code] ?? []
    const notLawArr = props.flag.NOTLaws[code] ?? []
    if (lawArr.includes(levelKey)) return 'success'
    if (notLawArr.includes(levelKey)) return 'danger'
    if (lawArr.length) return 'danger'
    return 'outline-secondary'
  }

  function getLawName(code: string): string { return props.lawnames[code]?.Name ?? code }
  function getLevelText(code: string, key: string): string { return props.lawnames[code]?.Types[key] ?? key }
  function formatLawsObj(obj: Record<string, string[]>): string {
    return Object.entries(obj).filter(([, v]) => v?.length).map(([code, levels]) => `${getLawName(code)}: ${levels.map(l => getLevelText(code, l)).join(', ')}`).join(' | ') || 'None'
  }

  const overviewLawsText = computed(() => formatLawsObj(props.flag.Laws))
  const overviewNotLawsText = computed(() => formatLawsObj(props.flag.NOTLaws))
</script>

<template>
  <BCard no-body class="mb-4 border-primary">
    <!-- Collapse Header / Overview -->
    <BCardHeader class="p-0 bg-primary bg-opacity-10 hover-overlay">
      <BButton variant="link" class="w-100 text-decoration-none text-dark text-start d-flex flex-wrap p-3" @click="isExpanded = !isExpanded">
        <div class="d-flex align-items-center me-4">
          <img :src="thumbnailSrc" alt="Flag thumbnail" class="border bg-white" style="width: 120px; height: auto;">
          <h5 class="ms-3 mb-0">{{ flag.FlagName || 'Flag Name' }}</h5>
        </div>
        <div class="flex-grow-1 small mt-2 mt-md-0">
          <div><strong class="text-muted">Flag ID:</strong> {{ flag.FlagID }}</div>
          <div><strong class="text-muted">Ideologies:</strong> {{ flag.Ideologies.join(', ') || 'None' }}</div>
          <div><strong class="text-success">Laws:</strong> {{ overviewLawsText }}</div>
          <div><strong class="text-danger">NOT Laws:</strong> {{ overviewNotLawsText }}</div>
        </div>
      </BButton>
    </BCardHeader>

    <!-- Flag Contents -->
    <BCollapse v-model="isExpanded">
      <BCardBody class="position-relative">
        <BButton variant="danger" size="sm" class="position-absolute top-0 end-0 m-3 z-3" @click="emit('remove', index)">
          Delete Flag
        </BButton>

        <BRow class="g-3 mb-4">
          <BCol md="6">
            <BFormGroup label="Name:" class="fw-bold">
              <BFormInput v-model="flag.FlagName" placeholder="Input Flag Name here" />
            </BFormGroup>
          </BCol>
          <BCol md="6">
            <BFormGroup label="Image ID:" class="fw-bold">
              <BFormInput :model-value="imageInputRaw" placeholder="Input Decal/Image ID here" @update:model-value="onImageInput" />
            </BFormGroup>
          </BCol>
          <BCol cols="12">
            <BFormGroup label="Description/Sources:" class="fw-bold">
              <BFormTextarea v-model="flag.Description" placeholder="Input Flag Description here" rows="2" />
            </BFormGroup>
          </BCol>
        </BRow>

        <!-- Ideology Tree (Uses layout classes) -->
        <div class="mb-4">
          <h6 class="fw-bold mb-3 text-center">Ideologies</h6>
          <!-- Note: Standard flex classes replace CSS tree. Modify structure if strict branching arrows are required -->
          <div class="d-flex flex-column align-items-center gap-2">
            <BButton :variant="ideologyVariant('Non-Aligned')" class="w-25" @click="toggleIdeology('Non-Aligned')">Non-Aligned</BButton>
            <div class="d-flex w-100 justify-content-center gap-3 mt-2">
              <div class="d-flex flex-column align-items-center gap-2">
                <BButton :variant="ideologyVariant('Socialism')" class="w-100" @click="toggleIdeology('Socialism')">Socialism</BButton>
                <BButton :variant="ideologyVariant('Communism')" size="sm" class="w-75" @click="toggleIdeology('Communism')">Communism</BButton>
              </div>
              <div class="d-flex flex-column align-items-center gap-2">
                <BButton :variant="ideologyVariant('Liberalism')" class="w-100" @click="toggleIdeology('Liberalism')">Liberalism</BButton>
                <BButton :variant="ideologyVariant('Democracy')" size="sm" class="w-75" @click="toggleIdeology('Democracy')">Democracy</BButton>
              </div>
              <div class="d-flex flex-column align-items-center gap-2">
                <BButton :variant="ideologyVariant('Nationalism')" class="w-100" @click="toggleIdeology('Nationalism')">Nationalism</BButton>
                <BButton :variant="ideologyVariant('Fascism')" size="sm" class="w-75" @click="toggleIdeology('Fascism')">Fascism</BButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Laws -->
        <div>
          <h6 class="fw-bold mb-3 text-center">Laws</h6>
          <div v-if="!sortedLaws.length" class="text-center py-3">
             <BSpinner label="Loading Laws..."></BSpinner>
          </div>
          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <BButton v-for="[code, law] in sortedLaws" :key="code" size="sm" :variant="lawSelectionVariant(code)" @click="selectLaw(code)">
              {{ law.Name }}
            </BButton>
          </div>

          <div v-if="selectedLawName" class="mt-4 border-top pt-3 text-center">
            <h6 class="fw-bold mb-3">{{ selectedLawName }}</h6>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <BButton v-for="(levelText, levelKey) in selectedLawTypes" :key="levelKey" :variant="levelVariant(String(levelKey))" @click="toggleLawLevel(String(levelKey))">
                {{ levelText }}
              </BButton>
            </div>
          </div>
        </div>
      </BCardBody>
    </BCollapse>
  </BCard>
</template>