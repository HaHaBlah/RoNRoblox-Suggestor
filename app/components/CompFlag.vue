<!-- components/CompFlag.vue -->
<script setup lang="ts">
  import type { FlagSpec } from '~/composables/useDynFlagger'

  import unknownFlag from '~/assets/images/Unknown Flag.png'

  export interface LawEntry { Name: string; Types: Record<string, string> }

  const props = defineProps<{ flag: FlagSpec; index: number; lawnames: Record<string, LawEntry> }>()
  const emit = defineEmits<{ remove: [index: number] }>()

  const isExpanded = ref(true)
  const thumbnailSrc = ref(unknownFlag)

  watch(
    () => props.flag.FlagID,
    async (id) => {
      if (!id) { thumbnailSrc.value = unknownFlag; return }
      try {
        const data = await $fetch<{ imageUrl: string }>(`/api/roblox-thumbnail?assetid=${encodeURIComponent(id)}&size=700x700`)
        thumbnailSrc.value = data.imageUrl
      } catch {
        thumbnailSrc.value = unknownFlag
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


  // --- Ideology Tree Data Structure ---
  // OrganizationChart requires a recursive 'children' structure
  const ideologyTree = ref({
    label: 'Non-Aligned',
    key: 'Non-Aligned',
    children: [
      {
        label: 'Socialism',
        key: 'Socialism',
        styleClass: 'ideology-socialism',
        children: [{ label: 'Communism', key: 'Communism', styleClass: 'ideology-communism' }]
      },
      {
        label: 'Liberalism',
        key: 'Liberalism',
        styleClass: 'ideology-liberalism',
        children: [{ label: 'Democracy', key: 'Democracy', styleClass: 'ideology-democracy' }]
      },
      {
        label: 'Nationalism',
        key: 'Nationalism',
        styleClass: 'ideology-nationalism',
        children: [{ label: 'Fascism', key: 'Fascism', styleClass: 'ideology-fascism' }]
      }
    ]
  })
  function toggleIdeology(ideology: string) {
    const idx = props.flag.Ideologies.indexOf(ideology)
    if (idx !== -1) props.flag.Ideologies.splice(idx, 1)
    else props.flag.Ideologies.push(ideology)
  }

  // Returns Bootstrap variants instead of CSS classes
  function ideologyVariant(ideology: string): string {
    if (props.flag.Ideologies.length === 0) {
      return 'yellow';
    }

    // If not empty, check for the specific ideology
    return props.flag.Ideologies.includes(ideology) ? 'green' : 'red';
  }

  const sortedLaws = computed(() => Object.entries(props.lawnames).sort(([, a], [, b]) => a.Name.localeCompare(b.Name)))
  const selectedLawCode = ref<string | null>(null)
  const selectedLawName = computed(() => selectedLawCode.value ? (props.lawnames[selectedLawCode.value]?.Name ?? '') : '')
  const selectedLawTypes = computed<Record<string, string>>(() => selectedLawCode.value ? (props.lawnames[selectedLawCode.value]?.Types ?? {}) : {})

  function selectLaw(code: string) { selectedLawCode.value = code }

  function lawSelectionVariant(code: string): string {
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

  function levelVariant(levelKey: string): string {
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

  function getLawName(code: string): string { return props.lawnames[code]?.Name ?? code }
  function getLevelText(code: string, key: string): string { return props.lawnames[code]?.Types[key] ?? key }
  function formatLawsObj(obj: Record<string, string[]>): string {
    return Object.entries(obj).filter(([, v]) => v?.length).map(([code, levels]) => `${getLawName(code)}: ${levels.map(l => getLevelText(code, l)).join(', ')}`).join(' | ') || 'None'
  }

  const overviewLawsText = computed(() => formatLawsObj(props.flag.Laws))
  const overviewNotLawsText = computed(() => formatLawsObj(props.flag.NOTLaws))
</script>

<template>
  <BCard no-body class="mb-4 border-yellow rounded-0">
    <!-- Collapse Header / Overview -->
    <BCardHeader class="p-0 bg-primary bg-opacity-10 hover-overlay">
      <BButton variant="link" class="w-100 text-decoration-none text-start d-flex flex-wrap p-3"
        @click="isExpanded = !isExpanded">
        <div class="d-flex align-items-center me-4">
          <img :src="thumbnailSrc" alt="Flag thumbnail" class="border bg-white"
            style="width: 120px; height: auto;" />
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
      <BCardBody class="position-relative">
        <BButton variant="red" size="sm" class="position-absolute top-0 end-0 m-3 z-3" @click="emit('remove', index)">
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
              <BFormInput :model-value="imageInputRaw" placeholder="Input Decal/Image ID here"
                @update:model-value="onImageInput" />
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
          <h6 class="fw-bold mb-2 text-center">Ideologies</h6>
          <div class="chart-container">
            <POrganizationChart :value="ideologyTree" :pt="{
              // Remove Node backgrounds and padding
              node: {
                style: { padding: '0', background: 'transparent', borderColor: 'transparent' }
              },
            }">
              <template #default="{ node }">
                <BButton :variant="ideologyVariant(node.key)" size="sm" class="ron-button"
                  @click.stop="toggleIdeology(node.key)" style="min-width: 8em;">
                  {{ node.label }}
                </BButton>
              </template>
            </POrganizationChart>
          </div>
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
              <BButton class="ron-button" v-for="(levelText, levelKey) in selectedLawTypes" :key="levelKey"
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
<style>

  .chart-container {
    /* Set Orgchart Connector Color */
    --p-organizationchart-connector-color: var(--ron-connector-dark);

    /* Adjust Vertical Distance */
    --p-organizationchart-connector-height: 0.5em;

    /* Adjust Horizontal Distance */
    --p-organizationchart-gutter: 0.2em;

    --p-organizationchart-connector-border-radius: 0;

    /* Connector Width */
    --ron-connector-width: 6px;
  }

  .p-organizationchart-connector-down {
    width: var(--ron-connector-width) !important;
  }

  .p-organizationchart-connector-left {
    border-top-width: var(--ron-connector-width) !important;
    border-right-width: var(--ron-connector-width) !important;
  }

  .p-organizationchart-connector-right {
    border-top-width: var(--ron-connector-width) !important;
  }

  /* Hide the overhanging top borders on the very first and very last items */
  .p-organizationchart-connectors>td:first-child,
  .p-organizationchart-connectors>td:last-child {
    border-top-color: transparent !important;
  }

  .p-organizationchart-connectors :nth-child(1 of .p-organizationchart-connector-right) {
    border-inline-start: var(--ron-connector-width) solid var(--p-organizationchart-connector-color);
    border-start-start-radius: var(--p-organizationchart-connector-border-radius);
  }
</style>