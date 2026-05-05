// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "nitro-cloudflare-dev",
    "@bootstrap-vue-next/nuxt",
    "@nuxt/image",
    // "@nuxt/ui",
    "@primevue/nuxt-module",
  ],
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "@/assets/style.css",
    // "primeicons/primeicons.css",
  ],

  app: {
    head: {
      title: "Suggestor", // default fallback title
      htmlAttrs: {
        lang: "en",
        "data-bs-theme": "dark",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
      meta: [
        {
          name: "Suggestor",
          content: "Tools for the Rise of Nations suggestions community.",
        },
        { name: "og:title", content: "Suggestor" },
        {
          name: "og:description",
          content: "Tools for the Rise of Nations suggestions community.",
        },
        { name: "og:image", content: "https://i.imgur.com/NQS7FDH.png" },
        { name: "og:url", content: "https://ronroblox-suggestor.pages.dev" },
        { name: "theme-color", content: "#FF0000" },
        { property: "og:type", content: "website" },
      ],
    },
  },

  bootstrapVueNext: {
    composables: true,
  },

  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      nodeCompat: true,
    },
  },

  primevue: {
    components: { prefix: "P" },
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '[data-bs-theme="dark"]', // ties PrimeVue dark mode to Bootstrap's toggle
        },
      },
    },
  },

  image: {
    dir: "assets/images", //default images directory
  },

  runtimeConfig: {
    robloxApiKey: process.env.ROBLOX_API_KEY ?? "",
    public: {
      apiBase:
        process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:8787",
    },
  },
});
