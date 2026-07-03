<!-- pages/Changelog.vue -->
<script setup lang="ts">
    useHead({
        title: "Changelog",
    });

    interface ChangelogEntry {
        date: string;
        version?: string;
        changes: string[];
    }

    const changelog: ChangelogEntry[] = [
        {
            date: '2026-07-03',
            version: 'v2.6',
            changes: [
                'Addded Additional Requirements section to Formabler',
            ],
        },
        {
            date: '2026-07-01',
            version: 'v2.5',
            changes: [
                'Addded autofill functionality to Cityer, Resourcer and ModifierEffects',
            ],
        },
        {
            date: '2026-06-04',
            version: 'v2.4',
            changes: [
                'Added Releasabler',
            ],
        },
        {
            date: '2026-06-03',
            version: 'v2.3',
            changes: [
                'Added Formabler',
            ],
        },
        {
            date: '2026-05-27',
            version: 'v2.2',
            changes: [
                'Input validation added',
            ],
        },
        {
            date: '2026-05-23',
            version: 'v2.1',
            changes: [
                'Cityer page functional requirements added',
            ],
        },
        {
            date: '2026-05-11',
            version: 'v2.0',
            changes: [
                'UI updated up to standards',
            ],
        },
        {
            date: '2026-05-4',
            version: 'v1.3',
            changes: [
                'Added OrgChart from PrimeVue to replace the old CSS only tree structure for ideology tree visualisation',
            ],
        },
        {
            date: '2026-05-4',
            version: 'v1.2',
            changes: [
                'Functional conversion of the original Dyn-Flagger page to Nuxt 3 and Vue 3 completed.',
            ],
        },
        {
            date: '2026-04-17',
            version: 'v1.1',
            changes: [
                'Project Suggestor started to add more than just Dynamic Flag suggestions.',
                'Started the work of converting the architecture and codebase from just pure HTML and JavaScript to a full Vue + Nuxt webapp.',
                'https://github.com/HaHaBlah/RoNRoblox-Suggestor/commit/b86b9b79cc824d51878b132351f4ae7921987b53',
            ],
        },
        {
            date: '2026-04-1',
            version: 'v1.0',
            changes: [
                'Public Release of Dyn-Flagger at https://dyn-flagger.pages.dev/',
            ],
        },
        {
            date: '2026-03-22',
            version: 'v0.3',
            changes: [
                'Implemented decal -> image id conversion',
                'Improved api fetching reliability by using cloudflare wrangler',
                'Better accessibility and UI improvements',
            ],
        },
        {
            date: '2026-02-13',
            version: 'v0.2',
            changes: [
                'First prototype of Dyn-Flagger done',
            ],
        },
        {
            date: '2026-01-28',
            version: 'v0.1',
            changes: [
                'Implemented fandom fetching and luaparse',
            ],
        },
        {
            date: '2026-01-21',
            version: 'v0.0',
            changes: [
                'Dyn-Flagger Project Start',
                'Experimenting with various Roblox API endpoints and data structures',
                'https://github.com/HaHaBlah/Dyn-Flagger/commit/017b684ccb882b6766f20deaadf2bdd942df5bef',
            ],
        },
    ];

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
</script>

<template>
    <div class="page-wrapper text-light">
        <BContainer class="py-4">
            <BCard class="bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
                <h1 class="text-center mb-0">Changelog</h1>
            </BCard>

            <BCard class="mt-4 bg-dark-2 border-0 rounded-0" body-class="p-1 p-sm-4">
                <p class="text-center text-secondary mb-5">All notable changes to this project are documented below.</p>

                <div class="d-flex flex-column gap-4 mx-auto" style="max-width: 800px;">
                    <div v-for="(entry, index) in changelog" :key="index" class="ps-4 py-2 border-start border-4"
                        :class="index === 0 ? 'border-primary' : 'border-secondary'">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <h2 class="h5 mb-0 fw-bold text-light">{{ formatDate(entry.date) }}</h2>
                            <BBadge v-if="entry.version" variant="primary" pill class="px-3 py-2 fw-medium">
                                {{ entry.version }}
                            </BBadge>
                        </div>

                        <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                            <li v-for="(change, changeIndex) in entry.changes" :key="changeIndex"
                                class="d-flex align-items-start">
                                <span class="text-primary me-2 fw-bold fs-5 lh-1">&bull;</span>
                                <span class="lh-base">{{ change }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </BCard>
        </BContainer>
    </div>
</template>

<style scoped>
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