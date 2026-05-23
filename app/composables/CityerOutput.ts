// composables/CityerOutput.ts
import { computed } from "vue";
import { useState } from "#app";

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  population: number | string;
  country: string;
}

export const useCityer = () => {
  // useState ensures the state is shared across components
  const cities = useState<CityData[]>("cityer-cities", () => []);

  const addCity = (city: CityData) => {
    cities.value.push(city);
  };

  const clearCities = () => {
    cities.value = [];
  };

  // Automatically generates the formatted string based on your required format
  const citiesBlock = computed(() => {
    if (cities.value.length === 0) return "";

    return cities.value
      .map(
        (c) =>
          `{[[${c.name}]], ${c.lat}, ${c.lng}, ${c.population}/27000000, '', [[${c.country}]]},`,
      )
      .join("\n");
  });

  const formattedOutput = computed(() => {
    if (cities.value.length === 0) return "";

    return [
        "```lua", 
        citiesBlock.value, 
        "```",
        "--[[",
        "> -# *Made using [Cityer](https://ronroblox-suggestor.pages.dev/Cityer/ )*",
        "]]",
      ].join("\n");
  });

  return {
    cities,
    addCity,
    clearCities,
    formattedOutput,
  };
};
