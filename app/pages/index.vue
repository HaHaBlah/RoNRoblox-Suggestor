<!-- pages/index.vue -->
<script setup>
  import { useHead } from '#app';

  useHead({
    title: "RoNRoblox Suggestor — Home",
  });

  const scrollToUtilities = () => {
    document.getElementById('utilities-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tools = [
    {
      id: "formabler",
      name: "Formabler",
      route: "/Formabler",
      icon: "📜",
      tagline: "Formables & Missions",
      description: "Generate complete Lua code snippets for formables and missions. Autofill capabilities make it easy to create complex configurations based on the latest wiki data, ensuring your suggestions are always up-to-date and formatted correctly.",
      badge: "Formables",
      accent: "#c0932a",
    },
    {
      id: "dynflagger",
      name: "Dyn-Flagger",
      route: "/Dyn-Flagger",
      icon: "🚩",
      tagline: "Format Errors Begone",
      description: "Generate dynamic/national flags. Eliminate format errors when posting  flags to Discord.",
      badge: "Flags",
      accent: "#2a6fc0",
    },
    {
      id: "cityer",
      name: "Cityer",
      route: "/Cityer",
      icon: "🗺️",
      tagline: "Has a Map",
      description: "Click on an interactive map to capture precise city coordinates for your suggestion.",
      badge: "Interactive Map",
      accent: "#2ac07a",
    },
  ];

  const wikiModules = [
    { name: "Module:Tagdata", url: "https://ronroblox.fandom.com/wiki/Module:Tagdata", color: "#c0932a", usedBy: "Formabler, Dyn-Flagger" },
    { name: "Module:Nationdata", url: "https://ronroblox.fandom.com/wiki/Module:Nationdata", color: "#c0932a", usedBy: "Formabler, Dyn-Flagger" },
    { name: "Module:Modifierdata", url: "https://ronroblox.fandom.com/wiki/Module:Modifierdata", color: "#c0932a", usedBy: "Formabler" },
    { name: "Module:ModifierEffectsAlignment", url: "https://ronroblox.fandom.com/wiki/Module:ModifierEffectsAlignment", color: "#2a6fc0", usedBy: "Formabler" },
    { name: "Module:Flagdata", url: "https://ronroblox.fandom.com/wiki/Module:Flagdata", color: "#c0932a", usedBy: "Dyn-Flagger" },
    { name: "Module:Lawnames", url: "https://ronroblox.fandom.com/wiki/Module:Lawnames", color: "#2a6fc0", usedBy: "Dyn-Flagger" },
  ];
</script>

<template>
  <div class="page-wrapper text-light">
    <BContainer class="py-4">

      <!-- HERO SECTION -->
      <BCard class="bg-dark-2 border-0 rounded-0 position-relative overflow-hidden" body-class="p-1 p-sm-5 text-center">
        <div class="position-absolute top-0 bottom-0 start-0 end-0" aria-hidden="true" />

        <div class="position-relative z-1 py-4">
          <div class="d-flex align-items-center justify-content-center gap-3 mb-4">
            <span class="eyebrow-line" />
            <span class="font-monospace text-gold small tracking-wide">RISE OF NATIONS · ROBLOX</span>
            <span class="eyebrow-line" />
          </div>

          <h1 class="display-1 font-display fw-bold mb-4 d-flex flex-column lh-1">
            <span>SUGGESTOR</span>
          </h1>

          <p class="lead text-secondary mx-auto mb-5 fw-light" style="max-width: 600px;">
            Specialised tools for Suggestia. <br>Generate Formables, Dynamic Flags, Cities. <br>Synced with the RoN
            wiki.
          </p>

          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <BButton variant="gold" class="font-monospace fw-bold text-uppercase px-4 py-2 custom-btn-clip"
              @click="scrollToUtilities">
              Open a Tool
            </BButton>
          </div>
        </div>
      </BCard>

      <!-- UTILITIES SECTION -->
      <BCard id="utilities-section" class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-5">
        <div class="mb-5 text-center">
          <span class="font-monospace text-gold small tracking-wide d-block mb-2">TOOLKIT</span>
          <h2 class="display-5 font-display text-white mb-0">Available Utilities</h2>
        </div>

        <BRow class="g-4">
          <BCol md="6" lg="4" v-for="tool in tools" :key="tool.id">
            <NuxtLink :to="tool.route" class="text-decoration-none h-100 d-block tool-link"
              :style="{ '--accent': tool.accent }">
              <BCard bg-variant="dark" border-variant="secondary" class="h-100 custom-tool-card text-light">
                <div class="d-flex flex-column h-100 gap-3">
                  <span class="badge border border-current align-self-start font-monospace tool-badge"
                    :style="{ color: tool.accent, borderColor: tool.accent }">
                    {{ tool.badge }}
                  </span>

                  <div class="fs-1 position-relative">
                    {{ tool.icon }}
                  </div>

                  <div class="flex-grow-1">
                    <h3 class="font-display h2 mb-1">{{ tool.name }}</h3>
                    <p class="font-monospace small text-uppercase mb-3" :style="{ color: tool.accent }">
                      {{ tool.tagline }}
                    </p>
                    <p class="text-secondary small fw-light mb-0">
                      {{ tool.description }}
                    </p>
                  </div>
                </div>
                <div class="tool-accent-bar position-absolute bottom-0 start-0" />
              </BCard>
            </NuxtLink>
          </BCol>
        </BRow>
      </BCard>

      <!-- STATS SECTION -->
      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <BRow class="text-center g-3 align-items-center">
          <BCol cols="6" md="3" class="d-flex flex-column gap-1">
            <span class="display-5 font-display text-gold lh-1">5</span>
            <span class="font-monospace text-secondary small tracking-wide">Integrated Tools</span>
          </BCol>
          <BCol cols="6" md="3" class="d-flex flex-column gap-1 border-md-start border-secondary">
            <span class="display-5 font-display text-gold lh-1">6+</span>
            <span class="font-monospace text-secondary small tracking-wide">Wiki Modules Used</span>
          </BCol>
          <BCol cols="6" md="3" class="d-flex flex-column gap-1 border-md-start border-secondary">
            <span class="display-5 font-display text-gold lh-1">LUA</span>
            <span class="font-monospace text-secondary small tracking-wide">Code Generation</span>
          </BCol>
          <BCol cols="6" md="3" class="d-flex flex-column gap-1 border-md-start border-secondary">
            <span class="display-5 font-display text-gold lh-1">RoN</span>
            <span class="font-monospace text-secondary small tracking-wide">Community Built</span>
          </BCol>
        </BRow>
      </BCard>

      <!-- ABOUT SECTION -->
      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-5">
        <BRow class="align-items-center g-5">
          <BCol lg="6">
            <span class="font-monospace text-gold small tracking-wide d-block mb-2">ABOUT</span>
            <h2 class="display-5 font-display text-white mb-4">Built for Suggestia</h2>
            <p class="text-secondary fw-light mb-3">
              The RoNRoblox Suggestor targets suggestors who need to suggest things without having to learn Lua just to
              format their suggestions. Specifically those found on the RoN Discord.
            </p>
            <p class="text-secondary fw-light mb-4">
              Each tool is kept in sync with the relevant modules on the RoN wiki so your generated code remains
              accurate
              as the wiki is updated.
            </p>
            <NuxtLink class="text-gold text-decoration-none font-monospace small" to="/Credits">
              Meet the contributors &rarr;
            </NuxtLink>
          </BCol>

          <BCol lg="6">
            <div class="d-flex flex-column gap-2 border-start border-secondary ps-4 py-2">
              <div v-for="mod in wikiModules" :key="mod.name"
                class="bg-dark border border-secondary p-2 px-3 d-flex align-items-center gap-3">
                <span class="rounded-circle" :style="{ width: '8px', height: '8px', backgroundColor: mod.color }" />
                <NuxtLink :to="mod.url" target="_blank" rel="noopener"
                  class="font-monospace small text-light text-decoration-none module-link flex-grow-1">
                  {{ mod.name }}
                </NuxtLink>
                <span class="font-monospace text-secondary" style="font-size: 0.7rem;">used by {{ mod.usedBy }}</span>
              </div>
            </div>
          </BCol>
        </BRow>
      </BCard>

    </BContainer>
  </div>
</template>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;600&display=swap');

  .page-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-image: url("@/assets/images/AllFlags.jpg");
    background-repeat: repeat;
    background-size: auto;
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
  }

  .font-display {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 0.04em;
  }

  .font-monospace {
    font-family: 'JetBrains Mono', monospace;
  }

  .tracking-wide {
    letter-spacing: 0.15em;
  }

  .eyebrow-line {
    width: 40px;
    height: 1px;
    background: var(--bs-gold);
    opacity: 0.6;
  }

  .custom-btn-clip {
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }

  /*INTERACTIVE CARDS */
  .custom-tool-card {
    transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
    overflow: hidden;
  }

  .tool-link:hover .custom-tool-card {
    border-color: var(--accent) !important;
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, .4), 0 0 0 1px var(--accent);
  }

  .tool-accent-bar {
    height: 2px;
    width: 0;
    background: var(--accent);
    transition: width 0.35s ease;
  }

  .tool-link:hover .tool-accent-bar {
    width: 100%;
  }

  .tool-badge {
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .tool-link:hover .tool-badge {
    opacity: 1;
  }

  .module-link:hover {
    color: var(--bs-gold) !important;
    text-decoration: underline !important;
  }

  /* RESPONSIVE */
  @media (min-width: 768px) {
    .border-md-start {
      border-left: 1px solid var(--bs-secondary) !important;
    }
  }
</style>