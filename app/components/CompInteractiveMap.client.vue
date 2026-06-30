<!-- components/CompInteractiveMap.client.vue -->
<script setup>
    import { ref, shallowRef, onMounted, onUnmounted, markRaw, nextTick, watch } from 'vue'
    import { useRuntimeConfig } from '#app'
    import * as maptilersdk from '@maptiler/sdk'
    import '@maptiler/sdk/dist/maptiler-sdk.css'
    import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
    import { useCityer } from '@/composables/CityerOutput'
    import { FandomLists } from '~/composables/FandomLists'

    const config = useRuntimeConfig()
    const { addCity } = useCityer()

    const map = shallowRef(null)
    const currentMarker = shallowRef(null)
    const permanentMarkers = shallowRef([])

    const mapContainerRef = ref(null)
    const startingCountries = ref([])

    // 1. Fetch countries at the root level to preserve the Nuxt useFetch context
    FandomLists().then(({ startingCountriesList }) => {
        watch(startingCountriesList, (val) => {
            startingCountries.value = val || [];
        }, { immediate: true });
    }).catch(err => console.error("Failed to load country list:", err));

    onMounted(async () => {
        await nextTick();

        if (!mapContainerRef.value) {
            console.error("Map container DOM element is not ready.")
            return
        }

        maptilersdk.config.apiKey = config.public.mapTilerApiKey;

        map.value = markRaw(new maptilersdk.Map({
            container: mapContainerRef.value,
            style: "https://api.maptiler.com/maps/019e109b-e359-7208-8d7f-b81a924e0bac/style.json",
        }))

        const geocoder = new GeocodingControl()
        map.value.addControl(geocoder, 'top-left')

        map.value.on('click', (e) => {
            const { lng, lat } = e.lngLat

            if (currentMarker.value) {
                currentMarker.value.remove()
            }

            const popupContainer = document.createElement('div');
            popupContainer.className = 'p-2';
            popupContainer.style.minWidth = '240px';

            // HTML Structure mirroring BListGroup styling
            popupContainer.innerHTML = `
                <div class="p-2 bg-dark-2">
                    <h5 class="fw-bold mb-1">Pin Location</h5>
                    <p class="text-muted mb-3" style="font-size: 0.85rem;">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                    <div class="mb-3">
                        <input type="text" id="cityName" class="form-control form-control-sm mb-2 custom-input" placeholder="City Name (e.g. West Jerusalem)" />
                        
                        <div class="position-relative mb-2">
                            <input type="text" id="cityCountry" class="form-control form-control-sm custom-input" placeholder="Country (e.g. Israel)" autocomplete="off" />
                            <div id="countryDropdown" class="list-group position-absolute w-100 shadow-sm mt-1 d-none" style="max-height: 180px; overflow-y: auto; z-index: 1050; top: 100%; left: 0; background-color: var(--bs-gray-900);">
                            </div>
                        </div>

                        <input type="number" id="cityPopulation" class="form-control form-control-sm mb-3 custom-input" placeholder="Population (e.g. 1159900)" />
                    </div>
                    <button id="saveLocationBtn" class="btn btn-green btn-sm w-100 fw-bold">
                        Save City
                    </button>
                </div>
            `;

            // --- Custom Dropdown Logic ---
            const countryInput = popupContainer.querySelector('#cityCountry');
            const countryDropdown = popupContainer.querySelector('#countryDropdown');

            const renderDropdown = (query) => {
                const q = (query || '').toLowerCase().trim();
                let filtered = startingCountries.value;

                if (q) {
                    filtered = startingCountries.value.filter(c => c.toLowerCase().includes(q));
                }

                // Limit to 50 for performance, just like CompTagInput
                filtered = filtered.slice(0, 50);

                if (filtered.length === 0) {
                    countryDropdown.innerHTML = `<div class="list-group-item text-muted p-2 border-secondary" style="font-size: 0.85rem; background-color: var(--bs-gray-900);">No matching countries</div>`;
                } else {
                    countryDropdown.innerHTML = filtered.map(country => `
                        <button type="button" class="list-group-item list-group-item-action d-flex align-items-center p-2 border-secondary country-option" data-value="${country}" style="font-size: 0.85rem; background-color: var(--bs-gray-900); color: white; cursor: pointer;">
                            <img src="/api/flag/${encodeURIComponent(country)}" alt="${country}" class="me-2 border bg-ron-button-dark" style="width: 24px; height: 16px; object-fit: cover;" loading="lazy">
                            ${country}
                        </button>
                    `).join('');
                }

                // Add click events to dropdown items
                countryDropdown.querySelectorAll('.country-option').forEach(btn => {
                    btn.addEventListener('mousedown', (evt) => {
                        evt.preventDefault(); // Prevents input blur from firing first
                        countryInput.value = btn.getAttribute('data-value');
                        countryDropdown.classList.add('d-none');
                    });
                });
            };

            countryInput.addEventListener('focus', () => {
                renderDropdown(countryInput.value);
                countryDropdown.classList.remove('d-none');
            });

            countryInput.addEventListener('input', (e) => {
                renderDropdown(e.target.value);
                countryDropdown.classList.remove('d-none');
            });

            countryInput.addEventListener('blur', () => {
                setTimeout(() => { countryDropdown.classList.add('d-none'); }, 150);
            });
            // ------------------------------

            // Save functionality
            const saveBtn = popupContainer.querySelector('#saveLocationBtn');
            saveBtn.addEventListener('click', () => {
                const name = popupContainer.querySelector('#cityName').value.trim();
                const country = popupContainer.querySelector('#cityCountry').value.trim();
                const population = popupContainer.querySelector('#cityPopulation').value || 0;

                if (!name || !country) {
                    alert('Please provide at least a Name and Country.');
                    return;
                }

                addCity({
                    name,
                    country,
                    population,
                    lat: parseFloat(lat.toFixed(4)),
                    lng: parseFloat(lng.toFixed(4))
                });

                const savedMarker = markRaw(new maptilersdk.Marker({ color: "#28a745" })
                    .setLngLat([lng, lat])
                    .addTo(map.value));

                permanentMarkers.value.push(savedMarker);

                currentMarker.value.remove();
                currentMarker.value = null;
            });

            const popup = new maptilersdk.Popup({ offset: 25, closeOnClick: false }).setDOMContent(popupContainer)

            currentMarker.value = markRaw(new maptilersdk.Marker({ color: "#dc3545" })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map.value))

            currentMarker.value.togglePopup()
        })
    })

    onUnmounted(() => {
        if (map.value) {
            map.value.remove()
        }
    })
</script>

<template>
    <div class="map-wrapper">
        <div ref="mapContainerRef" class="map-container"></div>
    </div>
</template>

<style scoped>
    .map-wrapper {
        position: relative;
        width: 100%;
        height: 60vh;
        min-height: 400px;
        background-color: black;
    }

    .map-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
    }
</style>
<style>
    /* --- MAPLIBRE POPUP DARK MODE OVERRIDES --- */

    .maplibregl-popup-content {
        background-color: var(--ron-dark-2);
        padding: 0;
        border: none;
    }

    .maplibregl-popup-anchor-top .maplibregl-popup-tip {
        border-bottom-color: var(--ron-dark-2);
    }

    .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
        border-top-color: var(--ron-dark-2);
    }

    .maplibregl-popup-anchor-left .maplibregl-popup-tip {
        border-right-color: var(--ron-dark-2);
    }

    .maplibregl-popup-anchor-right .maplibregl-popup-tip {
        border-left-color: var(--ron-dark-2);
    }

    .maplibregl-popup-close-button {
        color: #fff;
        font-size: 1.25rem;
        padding: 4px 8px;
    }

    .maplibregl-popup-close-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-top-right-radius: 0.25rem;
    }

    /* Target specific hover effects for injected list group items */
    .country-option:hover,
    .country-option:focus {
        background-color: rgba(255, 255, 255, 0.1) !important;
        outline: none;
    }
</style>