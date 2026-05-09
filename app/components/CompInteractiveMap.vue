<!-- components/CompInteractiveMap.vue -->
<script setup>
    import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue'
    import { useRuntimeConfig } from '#app'

    // Import MapLibre engine and CSS
    import maplibregl from 'maplibre-gl'
    import 'maplibre-gl/dist/maplibre-gl.css'

    // FIX 1 & 2: Import the specific maplibregl control and its CSS
    import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
    // import '@maptiler/geocoding-control/style.css';

    const config = useRuntimeConfig()
    const mapContainer = shallowRef(null)

    const map = shallowRef(null)
    const currentMarker = shallowRef(null)

    onMounted(() => {
        if (!mapContainer.value) return

        // 1. Initialize Map
        map.value = markRaw(new maplibregl.Map({
            container: mapContainer.value,
            style: `https://api.maptiler.com/maps/hybrid-v4/style.json?key=${config.public.mapTilerApiKey}`,
            center: [0, 20],
            zoom: 1.5,
        }))

        map.value.on('style.load', () => {
            map.value.setProjection({ type: 'globe' })
        })

        // 2. Add the Search Bar (Geocoder)
        const geocoder = new GeocodingControl({
            apiKey: config.public.mapTilerApiKey,
            // maplibregl property is no longer strictly needed here since we import the maplibregl-specific control
        })
        map.value.addControl(geocoder, 'top-left')

        // 3. Handle Map Clicks to Add Markers
        map.value.on('click', (e) => {
            const { lng, lat } = e.lngLat

            // Remove the previous temporary marker if it exists
            if (currentMarker.value) {
                currentMarker.value.remove()
            }

            // FIX 3 & 4: Create a DOM element directly instead of a string.
            // This allows safe event binding without searching the DOM later.
            // Also switched Tailwind classes to Bootstrap classes based on your Nuxt config.
            const popupContainer = document.createElement('div');
            popupContainer.className = 'p-2';
            popupContainer.innerHTML = `
                <div class="text-dark p-3">
                <h5 class="fw-bold mb-1">Pin Location</h5>
                <p class="small text-secondary mb-2">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                <button class="btn btn-primary btn-sm w-100">
                    Save to Database 
                </button>
                <p>(Proof of concept rn, doesn't actually do anything yet)</p>
                </div>
            `;

            // Attach the click event directly to the button element inside our container
            const saveBtn = popupContainer.querySelector('button');
            saveBtn.addEventListener('click', () => {
                alert(`Lng: ${lng}, Lat: ${lat}`)
            });

            // Use setDOMContent instead of setHTML
            const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupContainer)

            // Add physical marker
            currentMarker.value = markRaw(new maplibregl.Marker({ color: "#FF0000" })
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
        <div ref="mapContainer" class="map-container"></div>
    </div>
</template>

<style scoped>
    .map-wrapper {
        position: relative;
        width: 100vw;
        height: 100vh;
        background-color: gray;
    }

    .map-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>