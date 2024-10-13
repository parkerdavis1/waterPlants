import { derived, writable } from 'svelte/store'

export const users = [
	{
		id: 1,
		name: 'Parker',
		avatar_url: 'https://happyplants.parker.town/parker-avatar.png',
		default_house_id: 1,
	},
	{
		id: 2,
		name: 'Nell',
		avatar_url: 'https://happyplants.parker.town/nellavatar.png',
		default_house_id: 1,
	},
]

export const currentUserId = writable(1)

export const currentUser = derived(
	currentUserId,
	($currentUserId) => users.filter((u) => u.id == $currentUserId)[0],
)
