<!-- CompTopNav.vue -->
<script setup></script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="/">RoN Roblox Suggestor</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/Credits">Credits</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/Formabler">Formabler</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/Dyn-Flagger">Dyn-Flagger</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
