// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nitro-cloudflare-dev", "@bootstrap-vue-next/nuxt"],
  css: ["bootstrap/dist/css/bootstrap.min.css"],

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },

  app: {
    head: {
      title: "Suggestor", // default fallback title
      htmlAttrs: {
        lang: "en",
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
        { property: "og:type", content: "website" },
      ],
    },
  },
});
