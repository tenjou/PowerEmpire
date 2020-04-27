import { store } from "wabi"

const add = (type, amount) => {
	if(!store.data.resources[type]) {
		console.error(`No such resource: ${type}`)
		return
	}
	store.data.resources[type] += amount
}

const remove = (type, amount) => {
	if(!store.data.resources[type]) {
		console.error(`No such resource: ${type}`)
		return
	}	
	store.data.resources[type] += amount
}

const has = (type, amount = 1) => {
	if(!store.data.resources[type]) {
		console.error(`No such resource: ${type}`)
		return false
	}
	return (store.data.resources[type] >= amount)
}

export default {
	add, remove, has
}