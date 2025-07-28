import { writable } from "svelte/store";

// export const waterPlantsView = writable(false);
export const waterPlantsView = $state({ value: false });

export const waterMultipleOpen = $state({ value: false });
