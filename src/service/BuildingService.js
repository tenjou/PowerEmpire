import { store } from "wabi" 
import MapService from "./MapService"
import Building from "../Building"
import Enum from "../Enum"
import Game from "../Game"
import db from "../../assets/db.json"

const build = (entityId, startX, startY) => {
	const map = store.data.map
	if(startX < 0 || startY < 0 || startX >= map.sizeX || startY >= map.sizeY) {
		console.error(`Invalid build cell: X:${startX}, Y:${startY}`)
		return
	}

	const config = db.assets.entities[entityId]
	const endX = startX + config.sizeX
	const endY = startY + config.sizeY
	if(!MapService.isAreaFree(startX, startY, endX, endY)) {
		console.error(`Area is not free: startX:${startX}, startY:${startY}, endX:${endX}, endY:${endY}`)
		return
	}

	const cellType = (entityId === "road") ? Enum.Cell.Road : Enum.Cell.Building
	for(let y = startY; y < endY; y++) {
		for(let x = startX; x < endX; x++) {
			const index = x + (map.sizeX * y) 
			store.set(`map/data/${index}`, cellType)
		}
	}

	const building = new Building(config)
	building.move(startX, startY)
	Game.addEntity(building)

	store.update("state/placement")
}

const clear = (x, y) => {
	const map = store.data.map
	if(x < 0 || y < 0 || x >= map.sizeX || y >= map.sizeY) {
		console.error(`Invalid build cell: X:${x}, Y:${y}`)
		return
	}
	
	const index = x + (map.sizeX * y) 
	const cellType = map.data[index]

	store.set(`map/data/${index}`, Enum.Cell.Grass)
}

const useBrush = (brush, x, y) => {
	if(brush === "arrow") {
		return
	}
	if(brush === "clear") {
		clear(x, y)
	}
	else {
		build(brush, x, y)
	}
}

const useSelectedBrush = (x, y) => {
	useBrush(store.data.state.brush, x, y)
}

const selectBrush = (brush) => {
	store.set("state/brush", brush)

	if(brush === "arrow" || brush === "clear") {
		store.set("state/placement/id", null)
	}
	else {
		store.set("state/placement", {
			id: brush,
			x: -100,
			y: -100
		})
	}
}

const isSpecialBrush = (brush) => {
	return (brush === "arrow" || brush === "clear")
}

const updatePlacement = (inputX, inputY) => {
	const placement = store.data.state.placement
	if(!placement.id) {
		return
	}
	const coords = MapService.getCoords(inputX, inputY)
	if(placement.x !== coords[0] || placement.y !== coords[1]) {
		const map = store.data.map
		const config = db.assets.entities[placement.id]
		placement.x = coords[0]
		placement.y = coords[1]
		if(placement.x >= map.sizeX - config.sizeX) {
			placement.x = map.sizeX - config.sizeX
		}
		if(placement.y >= map.sizeY - config.sizeY) {
			placement.y = map.sizeY - config.sizeY
		}
		store.update("state/placement")
	}
}

export default {
	build,
	useBrush,
	useSelectedBrush, selectBrush, isSpecialBrush,
	updatePlacement
}