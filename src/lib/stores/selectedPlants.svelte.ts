import { derived, writable, get } from 'svelte/store'

export const checkedObj = writable({})
// export const checkedPlants = derived(checkedObj, ($checkedObj) => {
// 	const stringArray = Object.keys($checkedObj).filter((key) => $checkedObj[key] === true)
// 	return stringArray.map((string) => Number(string))
// })

// checkedPlants.subscribe(() => {
// 	console.log('changing Checked Plants', get(checkedPlants))
// })

// export const checkedObj = $state(
// 	Object.fromEntries(data.plantsWater.map((plantWater) => [plantWater.plant.id, false])),
// )

// export const checkedObj = $state({})
