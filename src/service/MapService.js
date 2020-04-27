import { store } from "wabi"

const cellSizeX = 32
const cellSizeY = 32

const load = () => {
	const sizeX = 16
	const sizeY = 16
	const map = {
		data: new Array(sizeX * sizeY).fill(0),
		sizeX,
		sizeY
	}
	store.set("map", map)
}

const getCoords = (inputX, inputY) => {
	const x = inputX / cellSizeX | 0
	const y = inputY / cellSizeY | 0
	return [ x, y ]
}

export default {
	load,
	getCoords
}