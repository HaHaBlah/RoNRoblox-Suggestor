<!-- components/CompInteractiveMap.vue -->
<script setup>
    import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue'
    import { useRuntimeConfig } from '#app'


    import * as maptilersdk from '@maptiler/sdk'
    import '@maptiler/sdk/dist/maptiler-sdk.css'


    import { GeocodingControl } from "@maptiler/geocoding-control/maptilersdk";

    const config = useRuntimeConfig()

    const map = shallowRef(null)
    const currentMarker = shallowRef(null)

    onMounted(() => {
        maptilersdk.config.apiKey = config.public.mapTilerApiKey;

        // Initialize Map
        map.value = markRaw(new maptilersdk.Map({
            container: "mapContainer",
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
            popupContainer.innerHTML = `
                <div class="text-dark p-3">
                <h5 class="fw-bold mb-1">Pin Location</h5>
                <p class="small text-secondary mb-2">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                <button class="btn btn-primary btn-sm w-100">
                    Save to Database 
                </button>
                <p class="mt-2 mb-0 small text-muted">(Proof of concept rn, doesn't actually do anything yet)</p>
                </div>
            `;

            // Attach the click event directly to the button element inside our container
            const saveBtn = popupContainer.querySelector('button');
            saveBtn.addEventListener('click', () => {
                alert(`Lng: ${lng}, Lat: ${lat}`)
            });

            const popup = new maptilersdk.Popup({ offset: 25 }).setDOMContent(popupContainer)

            // Add physical marker
            currentMarker.value = markRaw(new maptilersdk.Marker({ color: "#FF0000" })
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
        <div id="mapContainer" class="map-container"></div>
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