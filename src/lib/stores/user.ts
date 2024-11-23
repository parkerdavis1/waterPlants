import { derived, writable } from 'svelte/store'

// export const users = [
// 	{
// 		id: 1,
// 		name: 'Parker',
// 		avatar_url: 'https://happyplants.parker.town/parker-avatar.png',
// 		default_house_id: 1,
// 	},
// 	{
// 		id: 2,
// 		name: 'Nell',
// 		avatar_url: 'https://happyplants.parker.town/nellavatar.png',
// 		default_house_id: 1,
// 	},
// ]
// const initValue = localStorage.getItem('userId')
// export const currentUserId = writable(initValue ? parseInt(initValue) : 1)

// export const currentUser = derived(currentUserId, ($currentUserId) =>
// 	users.find((u) => u.id == $currentUserId),
// )

// currentUserId.subscribe((value) => {
// 	console.log('currentUserId ChANGED', value)
// 	localStorage.setItem('userId', JSON.stringify(value))
// })
