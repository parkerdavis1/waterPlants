import { writable, type Writable } from 'svelte/store'

export const checkedObj: Writable<{ [key: number]: boolean }> = writable({})
