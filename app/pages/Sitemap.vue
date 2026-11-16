<!-- pages/Sitemap.vue -->
<script setup lang="ts">
  import { useHead } from '#app';

  useHead({
    title: "Sitemap - Suggestor",
    meta: [
      { property: "og:title", content: "Sitemap - Suggestor" },
      { property: "og:description", content: "Overview of all pages and tools on Suggestor." }
    ]
  });

  const tools = [
    { name: "Formabler", path: "/Formabler", desc: "Generate formables and mission configurations with autofill." },
    { name: "Dyn-Flagger", path: "/Dyn-Flagger", desc: "Generate dynamic and national flags for Rise of Nations." },
    { name: "Cityer", path: "/Cityer", desc: "Interactive map coordinate picker for city suggestions." },
    { name: "Releasabler", path: "/Releasabler", desc: "Generate releasable nation configurations." },
    { name: "Resourcer", path: "/Resourcer", desc: "Assign resources to tiles with autocomplete." },
  ];

  const pages = [
    { name: "Home", path: "/", desc: "Main landing page and tool selector." },
    { name: "Credits", path: "/Credits", desc: "Credits, acknowledgements, and data sources." },
    { name: "Changelog", path: "/Changelog", desc: "Version history and updates." },
  ];
</script>

<template>
  <div class="page-wrapper text-light">
    <BContainer class="py-4">
      <BCard class="bg-dark-2 border-0 rounded-0 mb-4" body-class="p-4 text-center">
        <h1 class="display-5 fw-bold mb-2">Sitemap</h1>
        <p class="text-secondary mb-0">Navigate all tools and pages available on Suggestor.</p>
      </BCard>

      <BRow class="g-4">
        <BCol md="6">
          <BCard class="bg-dark-2 border-0 rounded-0 h-100" body-class="p-4">
            <h4 class="fw-bold text-gold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-wrench"></i> Suggestion Tools
            </h4>
            <BListGroup flush class="bg-transparent">
              <BListGroupItem
                v-for="tool in tools"
                :key="tool.path"
                class="bg-transparent text-light border-secondary px-0 py-3"
              >
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <NuxtLink :to="tool.path" class="fw-bold text-decoration-none fs-5">
                    {{ tool.name }}
                  </NuxtLink>
                  <BBadge variant="primary">Tool</BBadge>
                </div>
                <p class="text-secondary small mb-0">{{ tool.desc }}</p>
              </BListGroupItem>
            </BListGroup>
          </BCard>
        </BCol>

        <BCol md="6">
          <BCard class="bg-dark-2 border-0 rounded-0 h-100" body-class="p-4">
            <h4 class="fw-bold text-gold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-compass"></i> Site Navigation
            </h4>
            <BListGroup flush class="bg-transparent">
              <BListGroupItem
                v-for="page in pages"
                :key="page.path"
                class="bg-transparent text-light border-secondary px-0 py-3"
              >
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <NuxtLink :to="page.path" class="fw-bold text-decoration-none fs-5">
                    {{ page.name }}
                  </NuxtLink>
                  <BBadge variant="secondary">Page</BBadge>
                </div>
                <p class="text-secondary small mb-0">{{ page.desc }}</p>
              </BListGroupItem>
            </BListGroup>
          </BCard>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
  .page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
