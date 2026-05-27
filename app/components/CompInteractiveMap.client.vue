<!-- components/CompInteractiveMap.client.vue -->
<script setup>
    import { ref, shallowRef, onMounted, onUnmounted, markRaw, nextTick } from 'vue'
    import { useRuntimeConfig } from '#app'
    import * as maptilersdk from '@maptiler/sdk'
    import '@maptiler/sdk/dist/maptiler-sdk.css'
    import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";
    import { useCityer } from '@/composables/CityerOutput' // Import our composable

    const config = useRuntimeConfig()
    const { addCity } = useCityer()

    const map = shallowRef(null)
    const currentMarker = shallowRef(null)
    const permanentMarkers = shallowRef([]) // Store saved markers

    const mapContainerRef = ref(null)

    onMounted( async () => {
        await nextTick(); // Ensure the DOM is updated

        // Abort if the container STILL isn't ready
        if (!mapContainerRef.value) {
            console.error("Map container DOM element is not ready.")
            return
        }

        maptilersdk.config.apiKey = config.public.mapTilerApiKey;

        // Initialize Map
        map.value = markRaw(new maptilersdk.Map({
            container: mapContainerRef.value,
            style: "https://api.maptiler.com/maps/019e109b-e359-7208-8d7f-b81a924e0bac/style.json",
        }))

        // Geocoder Search bar
        const geocoder = new GeocodingControl()
        map.value.addControl(geocoder, 'top-left')

        // Handle Map Clicks to Add Markers
        map.value.on('click', (e) => {
            const { lng, lat } = e.lngLat

            // Remove the previous temporary marker if it exists
            if (currentMarker.value) {
                currentMarker.value.remove()
            }

            const popupContainer = document.createElement('div');
            popupContainer.className = 'p-2';
            popupContainer.style.minWidth = '220px';
            popupContainer.innerHTML = `
                <div class="text-dark p-2">
                    <h5 class="fw-bold mb-1">Pin Location</h5>
                    <p class="small text-secondary mb-3">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                    
                    <input type="text" id="cityName" class="form-control form-control-sm mb-2" placeholder="City Name (e.g. West Jerusalem)" />
                    <input type="text" id="cityCountry" class="form-control form-control-sm mb-2" placeholder="Country (e.g. Israel)" />
                    <input type="number" id="cityPopulation" class="form-control form-control-sm mb-3" placeholder="Population (e.g. 1159900)" />
                    
                    <button id="saveLocationBtn" class="btn btn-primary btn-sm w-100 fw-bold">
                        Save City
                    </button>
                </div>
            `;

            // Attach the click event directly to the button element inside our container
            const saveBtn = popupContainer.querySelector('#saveLocationBtn');
            saveBtn.addEventListener('click', () => {
                const name = popupContainer.querySelector('#cityName').value.trim();
                const country = popupContainer.querySelector('#cityCountry').value.trim();
                const population = popupContainer.querySelector('#cityPopulation').value || 0;

                if (!name || !country) {
                    alert('Please provide at least a Name and Country.');
                    return;
                }

                // Add to our global state
                addCity({
                    name,
                    country,
                    population,
                    lat: parseFloat(lat.toFixed(4)),
                    lng: parseFloat(lng.toFixed(4))
                });

                // Create a permanent marker (Green to show it's saved)
                const savedMarker = markRaw(new maptilersdk.Marker({ color: "#28a745" })
                    .setLngLat([lng, lat])
                    .addTo(map.value));
                
                permanentMarkers.value.push(savedMarker);

                // Remove the temporary red marker
                currentMarker.value.remove();
                currentMarker.value = null;
            });

            const popup = new maptilersdk.Popup({ offset: 25, closeOnClick: false }).setDOMContent(popupContainer)

            // Add physical temporary marker (Red)
            currentMarker.value = markRaw(new maptilersdk.Marker({ color: "#dc3545" })
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map.value))

            currentMarker.value.togglePopup()
        })
    })

    // Clean up the WebGL context when the user navigates away from the page
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
        width: 100vw;
        height: 100vh;
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