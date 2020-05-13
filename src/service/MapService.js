import { store } from "wabi"
import Utils from "../Utils"
import Enum from "../Enum"

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

const isCellFree = (gridX, gridY) => {
	const map = store.data.map
	const index = gridX + (gridY * map.sizeX)
	return (map.data[index] === Enum.Cell.Ground)
}

const isAreaFree = (startX, startY, endX, endY) => {
	const map = store.data.map
	for(let y = startY; y < endY; y++) {
		for(let x = startX; x < endX; x++) {
			const index = x + (y * map.sizeX)
			if(map.data[index] !== Enum.Cell.Ground) {
				return false
			}
		}
	}
	return true
}

const findClosestRoad = (entity) => {
	const map = store.data.map
	const mapData = map.data
	const startX = entity.x
	const startY = entity.y
	const endX = entity.x + entity.config.sizeX
	const endY = entity.y + entity.config.sizeY

	for(let x = startX; x < endX; x++) {
		let index = x + ((startY - 1) * map.sizeX)
		if(index > 0 && index < mapData.length && mapData[index] === Enum.Cell.Road) {
			tmp[0] = x
			tmp[1] = startY - 1
			return tmp
		}

		index = x + (endY * map.sizeX)
		if(index > 0 && index < mapData.length && mapData[index] === Enum.Cell.Road) {
			tmp[0] = x
			tmp[1] = endY
			return tmp
		}
	}

	for(let y = startY; y < endY; y++) {
		let index = (startX - 1) + (y * map.sizeX)
		if(index > 0 && index < mapData.length && mapData[index] === Enum.Cell.Road) {
			tmp[0] = startX - 1
			tmp[1] = y
			return tmp
		}

		index = endX + (y * map.sizeX)
		if(index > 0 && index < mapData.length && mapData[index] === Enum.Cell.Road) {
			tmp[0] = endX
			tmp[1] = y
			return tmp
		}
	}

	tmp[0] = -1
	tmp[1] = -1
	return tmp
}

export default {
	load,
	getCoords, getScreenCoords,
	randomGridX, randomGridY,
	isCellFree, isAreaFree,
	findClosestRoad
}