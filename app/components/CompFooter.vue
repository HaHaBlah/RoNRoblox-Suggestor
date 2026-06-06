<!-- components/CompFooter.vue -->
<template>
  <footer class="footer-container mt-auto pt-4 border-top border-2 border-gold">
    <BContainer class="py-4">
      <BRow class="g-4">

        <BCol lg="4" md="6">
          <div class="p-3 rounded hover-lift text-center text-md-start">
            <h5
              class="text-uppercase fw-semibold text-gold mb-4 d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              style="font-size: 0.95rem; letter-spacing: 1px;">
              <i class="bi bi-globe fs-5"></i> About Suggestor
            </h5>
            <p class="text-white opacity-75 mb-0" style="font-size: 0.9rem; line-height: 1.6;">
              Suggestor is a comprehensive toolkit for the Rise of Nations Roblox community.
              Create formatted game suggestions with ease using these interactive tools.
            </p>
          </div>
        </BCol>

        <BCol lg="4" md="6">
          <div class="p-3 rounded hover-lift text-center text-md-start">
            <h5
              class="text-uppercase fw-semibold text-gold mb-4 d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              style="font-size: 0.95rem; letter-spacing: 1px;">
              <i class="bi bi-wrench fs-5"></i> Tools
            </h5>
            <ul class="list-unstyled mb-0 footer-links">
              <li class="mb-2">
                <BLink to="/Dyn-Flagger">Dyn-Flagger</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Formabler">Formabler</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Cityer">Cityer</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Releasabler">Releasabler</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Resourcer">Resourcer</BLink>
              </li>
            </ul>
          </div>
        </BCol>

        <BCol lg="4" md="6">
          <div class="p-3 rounded hover-lift text-center text-md-start">
            <h5
              class="text-uppercase fw-semibold text-gold mb-4 d-flex align-items-center justify-content-center justify-content-md-start gap-2"
              style="font-size: 0.95rem; letter-spacing: 1px;">
              <i class="bi bi-compass fs-5"></i> Navigation
            </h5>
            <ul class="list-unstyled mb-0 footer-links">
              <li class="mb-2">
                <BLink to="/">Home</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Sitemap">Sitemap</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Changelog">Changelog</BLink>
              </li>
              <li class="mb-2">
                <BLink to="/Credits">Credits</BLink>
              </li>
            </ul>
          </div>
        </BCol>
      </BRow>

      <hr class="border-gold opacity-25 my-4" />

      <BRow class="align-items-center">
        <BCol md="6" class="text-center text-md-start mb-3 mb-md-0">
          <p class="text-white opacity-75 mb-0" style="font-size: 0.85rem;">
            &copy; 2026 Suggestor.
          </p>
        </BCol>
        <BCol md="6" class="text-center text-md-end">
          <BButton href="https://github.com/HaHaBlah/RoNRoblox-Suggestor" target="_blank" rel="noopener noreferrer"
            variant="gold" class="fw-semibold d-inline-flex align-items-center gap-2 px-3 py-2 hover-lift-btn"
            style="font-size: 0.85rem;"><i class="bi bi-github"></i>Source Code</BButton><span
            class="text-white opacity-75 ms-3" style="font-size: 0.85rem;">by HaHaBlah</span>
        </BCol>
      </BRow>
    </BContainer>
  </footer>
</template>

<style scoped>
  .hover-lift {
    transition: transform 0.3s ease;
  }

  .hover-lift:hover,
  .hover-lift-btn:hover {
    transform: translateY(-4px);
  }

  /*  interactive link styling */
  .footer-links a {
    color: rgba(255, 255, 255, 0.8) !important;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    position: relative;
    display: inline-block;
  }

  .footer-links a::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 2px;
    background-color: var(--bs-gold);
    transition: width 0.3s ease;
  }

  .footer-links a:hover {
    color: var(--bs-gold) !important;
  }

  .footer-links a:hover::before {
    width: 100%;
  }
</style>