// server/api/fandom-data.ts
export default defineEventHandler((event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
  );
  return sendRedirect(event, "/data/fandom-data.json", 301);
});
