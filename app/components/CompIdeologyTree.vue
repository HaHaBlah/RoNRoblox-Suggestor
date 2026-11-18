<!-- components/CompIdeologyTree.vue -->
<script setup lang="ts">
  import { VueFlow, Handle, Position, BaseEdge } from '@vue-flow/core'
  import type { ButtonVariant } from 'bootstrap-vue-next'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'

  const props = defineProps<{
    selectedIdeologies: string[]
  }>()

  const emit = defineEmits<{
    toggle: [ideology: string]
  }>()

  // Track deep mutations to guarantee reactivity on button variant changes
  const ideologyVersion = ref(0)
  watch(
    () => props.selectedIdeologies,
    () => {
      ideologyVersion.value++
    },
    { deep: true }
  )

  let lastToggleTime = 0
  let lastToggledKey = ''

  function toggle(ideology: string) {
    const now = Date.now()
    if (now - lastToggleTime < 100 && lastToggledKey === ideology) {
      return
    }
    lastToggleTime = now
    lastToggledKey = ideology
    emit('toggle', ideology)
  }

  function onNodeClick(event: any) {
    const key = event?.node?.data?.key || event?.node?.id
    if (key) {
      toggle(key)
    }
  }

  function getVariant(ideology: string): ButtonVariant {
    if (!props.selectedIdeologies || props.selectedIdeologies.length === 0) {
      return 'yellow'
    }
    return props.selectedIdeologies.includes(ideology) ? 'green' : 'red'
  }

  const edgeStyle = {
    stroke: 'var(--ron-connector-dark, #13171d)',
    strokeWidth: 4,
  }

  // Generates 100% straight orthogonal tree paths with no S-curves or buffer offsets
  function getForkPath(sourceX: number, sourceY: number, targetX: number, targetY: number): string {
    if (Math.abs(sourceX - targetX) < 1) {
      return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`
    }
    const forkY = (sourceY + targetY) / 2
    return `M ${sourceX} ${sourceY} L ${sourceX} ${forkY} L ${targetX} ${forkY} L ${targetX} ${targetY}`
  }

  // Compact symmetrical coordinates designed to fit within standard mobile card widths (340px total span)
  // Col 1 center = 60, Col 2 center = 175, Col 3 center = 290 (115px between columns)
  const nodes = computed(() => {
    void ideologyVersion.value

    return [
      {
        id: 'Non-Aligned',
        type: 'ideology',
        position: { x: 125, y: 8 },
        data: {
          key: 'Non-Aligned',
          label: 'Non-Aligned',
          variant: getVariant('Non-Aligned'),
          hasTarget: false,
          hasSource: true
        }
      },
      {
        id: 'Socialism',
        type: 'ideology',
        position: { x: 10, y: 68 },
        data: {
          key: 'Socialism',
          label: 'Socialism',
          variant: getVariant('Socialism'),
          styleClass: 'ideology-socialism',
          hasTarget: true,
          hasSource: true
        }
      },
      {
        id: 'Liberalism',
        type: 'ideology',
        position: { x: 125, y: 68 },
        data: {
          key: 'Liberalism',
          label: 'Liberalism',
          variant: getVariant('Liberalism'),
          styleClass: 'ideology-liberalism',
          hasTarget: true,
          hasSource: true
        }
      },
      {
        id: 'Nationalism',
        type: 'ideology',
        position: { x: 240, y: 68 },
        data: {
          key: 'Nationalism',
          label: 'Nationalism',
          variant: getVariant('Nationalism'),
          styleClass: 'ideology-nationalism',
          hasTarget: true,
          hasSource: true
        }
      },
      {
        id: 'Communism',
        type: 'ideology',
        position: { x: 10, y: 126 },
        data: {
          key: 'Communism',
          label: 'Communism',
          variant: getVariant('Communism'),
          styleClass: 'ideology-communism',
          hasTarget: true,
          hasSource: false
        }
      },
      {
        id: 'Democracy',
        type: 'ideology',
        position: { x: 125, y: 126 },
        data: {
          key: 'Democracy',
          label: 'Democracy',
          variant: getVariant('Democracy'),
          styleClass: 'ideology-democracy',
          hasTarget: true,
          hasSource: false
        }
      },
      {
        id: 'Fascism',
        type: 'ideology',
        position: { x: 240, y: 126 },
        data: {
          key: 'Fascism',
          label: 'Fascism',
          variant: getVariant('Fascism'),
          styleClass: 'ideology-fascism',
          hasTarget: true,
          hasSource: false
        }
      }
    ]
  })

  const edges = ref([
    { id: 'e-na-soc', source: 'Non-Aligned', target: 'Socialism', type: 'fork', style: edgeStyle },
    { id: 'e-na-lib', source: 'Non-Aligned', target: 'Liberalism', type: 'fork', style: edgeStyle },
    { id: 'e-na-nat', source: 'Non-Aligned', target: 'Nationalism', type: 'fork', style: edgeStyle },
    { id: 'e-soc-com', source: 'Socialism', target: 'Communism', type: 'fork', style: edgeStyle },
    { id: 'e-lib-dem', source: 'Liberalism', target: 'Democracy', type: 'fork', style: edgeStyle },
    { id: 'e-nat-fas', source: 'Nationalism', target: 'Fascism', type: 'fork', style: edgeStyle },
  ])

  const containerRef = ref<HTMLElement | null>(null)
  let flowApi: any = null
  let resizeObserver: ResizeObserver | null = null

  function fitFlow() {
    if (flowApi) {
      nextTick(() => {
        flowApi.fitView({ padding: 0.03, includeHiddenNodes: true })
      })
    }
  }

  function onPaneReady(instance: any) {
    flowApi = instance
    fitFlow()
  }

  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        fitFlow()
      })
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })
</script>

<template>
  <div class="ideology-flow-outer w-100 py-1">
    <div ref="containerRef" class="ideology-flow-container">
      <ClientOnly>
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :elements-selectable="false"
          :zoom-on-scroll="false"
          :pan-on-drag="false"
          :pan-on-scroll="false"
          :zoom-on-pinch="false"
          :zoom-on-double-click="false"
          :prevent-scrolling="false"
          :fit-view-on-init="true"
          :auto-pan-on-node-drag="false"
          @pane-ready="onPaneReady"
          @node-click="onNodeClick"
        >
          <!-- Custom Node -->
          <template #node-ideology="{ data }">
            <div class="node-wrapper nodrag nopan" :class="data.styleClass">
              <Handle
                v-if="data.hasTarget"
                type="target"
                :position="Position.Top"
                class="hidden-handle"
              />
              <BButton
                :variant="data.variant"
                size="sm"
                class="ron-button ideology-btn nodrag nopan"
                @click.stop="toggle(data.key)"
              >
                {{ data.label }}
              </BButton>
              <Handle
                v-if="data.hasSource"
                type="source"
                :position="Position.Bottom"
                class="hidden-handle"
              />
            </div>
          </template>

          <!-- Custom Edge: 100% straight orthogonal fork -->
          <template #edge-fork="edgeProps">
            <BaseEdge
              :id="edgeProps.id"
              :path="getForkPath(edgeProps.sourceX, edgeProps.sourceY, edgeProps.targetX, edgeProps.targetY)"
              :style="edgeProps.style"
            />
          </template>
        </VueFlow>
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
  .ideology-flow-outer {
    display: flex;
    justify-content: center;
    overflow: hidden;
  }

  .ideology-flow-container {
    width: 100%;
    max-width: 360px;
    height: 180px;
    position: relative;
  }

  .node-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    cursor: pointer;
  }

  .ideology-btn {
    width: 100px;
    font-weight: 700;
    text-align: center;
    padding: 0.25rem 0.2rem;
    font-size: 0.8rem;
    cursor: pointer !important;
    white-space: nowrap;
  }

  .hidden-handle {
    opacity: 0 !important;
    width: 6px !important;
    height: 6px !important;
    min-width: 6px !important;
    min-height: 6px !important;
    border: none !important;
    background: transparent !important;
    pointer-events: none !important;
  }

  /* Ensure nodes and buttons capture pointer events and show pointer cursor */
  :deep(.vue-flow__nodes) {
    z-index: 10 !important;
    pointer-events: all !important;
  }

  :deep(.vue-flow__node) {
    z-index: 11 !important;
    pointer-events: all !important;
    cursor: pointer !important;
  }

  :deep(.vue-flow__node *) {
    pointer-events: all !important;
  }

  /* Edges should not block button clicks */
  :deep(.vue-flow__edges),
  :deep(.vue-flow__edge) {
    pointer-events: none !important;
  }

  /* Sharp orthogonal stroke joins */
  :deep(.vue-flow__edge-path) {
    stroke-linejoin: miter !important;
    stroke-linecap: square !important;
  }

  /* Ideology text colours matching game theme */
  .ideology-socialism :deep(button),
  .ideology-socialism button {
    color: #F3B6B6;
  }

  .ideology-communism :deep(button),
  .ideology-communism button {
    color: #F37B7B;
  }

  .ideology-liberalism :deep(button),
  .ideology-liberalism button {
    color: #B5B6F3;
  }

  .ideology-democracy :deep(button),
  .ideology-democracy button {
    color: #7B7BF3;
  }

  .ideology-nationalism :deep(button),
  .ideology-nationalism button {
    color: #B8B8B9;
  }

  .ideology-fascism :deep(button),
  .ideology-fascism button {
    color: #7B7B7B;
  }

  :deep(.vue-flow__pane) {
    cursor: default !important;
  }
</style>
