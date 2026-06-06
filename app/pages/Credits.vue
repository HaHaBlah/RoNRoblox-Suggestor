<!-- pages/Credits.vue -->
<script setup lang="ts">
  import { useHead } from '#app';

  useHead({
    title: "Credits - Suggestor",
  });

  interface CreditItem {
    title: string;
    subtitle?: string;
    description: string;
    category: string;
    image?: string;
    iconClass?: string;
    link?: string;
  }

  const predecessors: CreditItem[] = [
    {
      title: "Rise of Nations Roblox",
      subtitle: "Community Game",
      description: "The foundation of this project - a complex nation-building game on Roblox that inspired the need for community tools.",
      category: "Game",
      image: "https://static.wikia.nocookie.net/ronroblox/images/e/e0/RoN_Logo_Official.png",
      link: "https://www.roblox.com/games/2292063452"
    },
    {
      title: "RoN Fandom Wiki",
      subtitle: "Community Documentation",
      description: "Comprehensive wiki documenting all game mechanics, data structures, and configurations. Essential reference for all RoN tools.",
      category: "Resource",
      image: "https://static.wikia.nocookie.net/ronroblox/images/f/fa/Favicon.ico",
      link: "https://ronroblox.fandom.com"
    },
  ];

  const dataSources: CreditItem[] = [
    {
      title: "Fandom Wiki Modules",
      subtitle: "Dynamic Data",
      description: "Real-time game data synchronized from Fandom's Lua modules: Tagdata, Nationdata, Modifierdata, Flagdata, and Lawnames.",
      category: "Data Source",
      iconClass: "bi-database",
      link: "https://ronroblox.fandom.com/wiki/Module:Tagdata"
    },
    {
      title: "Roblox CDN",
      subtitle: "Asset Delivery",
      description: "Asset and thumbnail delivery for nation flags, icons, and decorative elements from the Roblox platform.",
      category: "Services",
      iconClass: "bi-images",
      link: "https://www.roblox.com"
    },
    {
      title: "MapTiler",
      subtitle: "Map Services",
      description: "Interactive map tiles and geocoding services powering the Cityer tool for precise coordinate selection.",
      category: "Services",
      image: "https://raw.githubusercontent.com/maptiler/maptiler-sdk-js/master/logo.svg",
      link: "https://www.maptiler.com"
    },
  ];

  const frameworks: CreditItem[] = [
    {
      title: "Vue 3",
      subtitle: "Frontend Framework",
      description: "Progressive JavaScript framework for building interactive user interfaces with composition API.",
      category: "Framework",
      image: "https://raw.githubusercontent.com/vuejs/art/master/logo.svg",
      link: "https://vuejs.org"
    },
    {
      title: "Nuxt 4",
      subtitle: "Meta Framework",
      description: "Full-stack framework built on Vue 3 providing file-based routing, server capabilities, and auto-imports.",
      category: "Framework",
      image: "https://raw.githubusercontent.com/nuxt/nuxt/main/packages/nuxt/res/logo.svg",
      link: "https://nuxt.com"
    },
    {
      title: "TypeScript",
      subtitle: "Type Safety",
      description: "Typed superset of JavaScript providing compile-time type checking and improved developer experience.",
      category: "Language",
      image: "https://raw.githubusercontent.com/microsoft/TypeScript/main/doc/media/TypeScript-logo.svg",
      link: "https://www.typescriptlang.org"
    },
    {
      title: "Bootstrap Vue",
      subtitle: "Vue Components",
      description: "Bootstrap components built with Vue 3, seamlessly integrated with Bootstrap 5 styling.",
      category: "Library",
      iconClass: "bi-puzzle-fill",
      link: "https://bootstrap-vue.org"
    },
    {
      title: "PrimeVue",
      subtitle: "Component Library",
      description: "Rich component library for Vue 3 providing advanced UI elements and interactions.",
      category: "Library",
      image: "https://www.primefaces.org/cdn/primevue/images/primevue-logo.svg",
      link: "https://primevue.org"
    },
    {
      title: "SCSS",
      subtitle: "CSS Preprocessor",
      description: "Professional CSS preprocessor enabling variables, nesting, mixins, and functions for advanced styling.",
      category: "Tool",
      iconClass: "bi-palette-fill",
      link: "https://sass-lang.com"
    },
  ];

  const services: CreditItem[] = [
    {
      title: "Cloudflare Workers",
      subtitle: "Serverless Computing",
      description: "Edge computing platform providing serverless backend execution for API requests and data processing.",
      category: "Services",
      image: "https://raw.githubusercontent.com/cloudflare/workers-sdk/main/packages/wrangler/logo-dark.svg",
      link: "https://workers.cloudflare.com"
    },
    {
      title: "Cloudflare Pages",
      subtitle: "Hosting & Deployment",
      description: "Modern static hosting platform providing fast, secure deployment with automatic builds from Git.",
      category: "Services",
      iconClass: "bi-cloud-check-fill",
      link: "https://pages.cloudflare.com"
    },
    {
      title: "Nitro",
      subtitle: "Backend Framework",
      description: "Nuxt backend framework enabling server-side routing, middleware, and API development.",
      category: "Framework",
      iconClass: "bi-lightning-fill",
      link: "https://nitro.unjs.io"
    },
  ];

  const utilities: CreditItem[] = [
    {
      title: "Lua Parsing",
      subtitle: "Data Processing",
      description: "Lua code parsing and manipulation for generating and validating game suggestion code.",
      category: "Utility",
      iconClass: "bi-code-slash",
    },
    {
      title: "Swiper.js",
      subtitle: "Carousel Component",
      description: "Touch-enabled carousel library for modifier browsing and content navigation.",
      category: "Library",
      image: "https://raw.githubusercontent.com/nolimits4web/Swiper/master/logo.svg",
      link: "https://swiperjs.com"
    },
  ];
</script>

<template>
  <div class="page-wrapper text-light">
    <BContainer class="py-4">
      <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <h1 class="text-center mb-0">Credits</h1>
      </BCard>

      <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
        <section class="credits-section mb-5">
          <div class="section-header mb-4">
            <h2 class="display-6 fw-bold">
              <i class="bi bi-rocket-fill text-gold"></i>
              Predecessors & Foundation
            </h2>
            <p class="text-muted">The community and platforms that inspired this project</p>
          </div>
          <BRow class="g-4">
            <BCol v-for="item in predecessors" :key="item.title" cols="12" md="6" xl="4">
              <BCard bg-variant="dark" text-variant="light" class="h-100 border-secondary custom-shadow"
                footer-class="bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                <template #header>
                  <div class="d-flex align-items-center gap-3">
                    <BImg v-if="item.image" :src="item.image" :alt="item.title" width="40" height="40" rounded />
                    <i v-else-if="item.iconClass" :class="[item.iconClass, 'fs-2 text-gold']"></i>
                    <div>
                      <h5 class="mb-0">{{ item.title }}</h5>
                      <small class="text-muted">{{ item.subtitle }}</small>
                    </div>
                  </div>
                </template>

                <BCardText class="text-secondary">{{ item.description }}</BCardText>

                <template #footer>
                  <BBadge style="background-color: #FFD059; color: #000;">{{ item.category }}</BBadge>
                  <BButton v-if="item.link" :href="item.link" target="_blank" variant="outline-warning" size="sm">
                    Visit <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </BButton>
                </template>
              </BCard>
            </BCol>
          </BRow>
        </section>

        <section class="credits-section mb-5">
          <div class="section-header mb-4">
            <h2 class="display-6 fw-bold">
              <i class="bi bi-database-fill text-gold"></i>
              Data Sources
            </h2>
            <p class="text-muted">Live data synchronization and content delivery</p>
          </div>
          <BRow class="g-4">
            <BCol v-for="item in dataSources" :key="item.title" cols="12" md="6" xl="4">
              <BCard bg-variant="dark" text-variant="light" class="h-100 border-secondary custom-shadow"
                footer-class="bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                <template #header>
                  <div class="d-flex align-items-center gap-3">
                    <BImg v-if="item.image" :src="item.image" :alt="item.title" width="40" height="40" rounded />
                    <i v-else-if="item.iconClass" :class="[item.iconClass, 'fs-2 text-gold']"></i>
                    <div>
                      <h5 class="mb-0">{{ item.title }}</h5>
                      <small class="text-muted">{{ item.subtitle }}</small>
                    </div>
                  </div>
                </template>
                <BCardText class="text-secondary">{{ item.description }}</BCardText>
                <template #footer>
                  <BBadge style="background-color: #FFD059; color: #000;">{{ item.category }}</BBadge>
                  <BButton v-if="item.link" :href="item.link" target="_blank" variant="outline-warning" size="sm">
                    Visit <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </BButton>
                </template>
              </BCard>
            </BCol>
          </BRow>
        </section>

        <section class="credits-section mb-5">
          <div class="section-header mb-4">
            <h2 class="display-6 fw-bold">
              <i class="bi bi-hammer-fill text-gold"></i>
              Frameworks & Libraries
            </h2>
            <p class="text-muted">Core technologies powering the application</p>
          </div>
          <BRow class="g-4">
            <BCol v-for="item in frameworks" :key="item.title" cols="12" md="6" xl="4">
              <BCard bg-variant="dark" text-variant="light" class="h-100 border-secondary custom-shadow"
                footer-class="bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                <template #header>
                  <div class="d-flex align-items-center gap-3">
                    <BImg v-if="item.image" :src="item.image" :alt="item.title" width="40" height="40" rounded />
                    <i v-else-if="item.iconClass" :class="[item.iconClass, 'fs-2 text-gold']"></i>
                    <div>
                      <h5 class="mb-0">{{ item.title }}</h5>
                      <small class="text-muted">{{ item.subtitle }}</small>
                    </div>
                  </div>
                </template>
                <BCardText class="text-secondary">{{ item.description }}</BCardText>
                <template #footer>
                  <BBadge style="background-color: #FFD059; color: #000;">{{ item.category }}</BBadge>
                  <BButton v-if="item.link" :href="item.link" target="_blank" variant="outline-warning" size="sm">
                    Visit <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </BButton>
                </template>
              </BCard>
            </BCol>
          </BRow>
        </section>

        <section class="credits-section mb-5">
          <div class="section-header mb-4">
            <h2 class="display-6 fw-bold">
              <i class="bi bi-cloud-fill text-gold"></i>
              Services & Deployment
            </h2>
            <p class="text-muted">Infrastructure and hosting solutions</p>
          </div>
          <BRow class="g-4">
            <BCol v-for="item in services" :key="item.title" cols="12" md="6" xl="4">
              <BCard bg-variant="dark" text-variant="light" class="h-100 border-secondary custom-shadow"
                footer-class="bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                <template #header>
                  <div class="d-flex align-items-center gap-3">
                    <BImg v-if="item.image" :src="item.image" :alt="item.title" width="40" height="40" rounded />
                    <i v-else-if="item.iconClass" :class="[item.iconClass, 'fs-2 text-gold']"></i>
                    <div>
                      <h5 class="mb-0">{{ item.title }}</h5>
                      <small class="text-muted">{{ item.subtitle }}</small>
                    </div>
                  </div>
                </template>
                <BCardText class="text-secondary">{{ item.description }}</BCardText>
                <template #footer>
                  <BBadge style="background-color: #FFD059; color: #000;">{{ item.category }}</BBadge>
                  <BButton v-if="item.link" :href="item.link" target="_blank" variant="outline-warning" size="sm">
                    Visit <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </BButton>
                </template>
              </BCard>
            </BCol>
          </BRow>
        </section>

        <section class="credits-section">
          <div class="section-header mb-4">
            <h2 class="display-6 fw-bold">
              <i class="bi bi-wrench-adjustable-fill text-gold"></i>
              Utilities & Tools
            </h2>
            <p class="text-muted">Supporting libraries and tools</p>
          </div>
          <BRow class="g-4">
            <BCol v-for="item in utilities" :key="item.title" cols="12" md="6" xl="4">
              <BCard bg-variant="dark" text-variant="light" class="h-100 border-secondary custom-shadow"
                footer-class="bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                <template #header>
                  <div class="d-flex align-items-center gap-3">
                    <BImg v-if="item.image" :src="item.image" :alt="item.title" width="40" height="40" rounded />
                    <i v-else-if="item.iconClass" :class="[item.iconClass, 'fs-2 text-gold']"></i>
                    <div>
                      <h5 class="mb-0">{{ item.title }}</h5>
                      <small class="text-muted">{{ item.subtitle }}</small>
                    </div>
                  </div>
                </template>
                <BCardText class="text-secondary">{{ item.description }}</BCardText>
                <template #footer>
                  <BBadge style="background-color: #FFD059; color: #000;">{{ item.category }}</BBadge>
                  <BButton v-if="item.link" :href="item.link" target="_blank" variant="outline-warning" size="sm">
                    Visit <i class="bi bi-box-arrow-up-right ms-1"></i>
                  </BButton>
                </template>
              </BCard>
            </BCol>
          </BRow>
        </section>
      </BCard>
    </BContainer>
  </div>
</template>

<style scoped>
  .section-header {
    position: relative;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(124, 105, 56, 0.3);
  }

  .custom-shadow {
    transition: transform 0.2s ease;
  }

  .custom-shadow:hover {
    transform: translateY(-4px);
  }

  .page-wrapper {
    flex: 1;
    /* fills space between header and footer */
    display: flex;
    flex-direction: column;
    background-image: url("@/assets/images/RoNMap SEAsia.png");
    background-repeat: no-repeat;
    background-size: cover;
  }

</style>