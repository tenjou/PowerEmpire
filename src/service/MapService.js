import { store } from "wabi"
import Utils from "../Utils"

const cellSizeX = 32
const cellSizeY = 32
const tmp = [ 0, 0 ]

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
	tmp[0] = inputX / cellSizeX | 0
	tmp[1] = inputY / cellSizeY | 0
	return tmp
}

const getScreenCoords = (gridX, gridY) => {
	tmp[0] = gridX * cellSizeX
	tmp[1] = gridY * cellSizeY
	return tmp
}

const randomGridX = () => {
	return Utils.randomNumber(0, store.data.map.sizeX - 1)
}

const randomGridY = () => {
	return Utils.randomNumber(0, store.data.map.sizeY - 1)
}

export default {
	load,
	getCoords, getScreenCoords,
	randomGridX, randomGridY
}