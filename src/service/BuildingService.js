import { store } from "wabi" 
import MapService from "./MapService"
import PopulationService from "./PopulationService"
import { Building, House, ServiceBuilding } from "../Entity"
import Enum from "../Enum"
import Game from "../Game"
import db from "../../assets/db.json"

const serviceBuildings = []

Game.subscribe(Enum.Event.EntityAdd, (entity) => {
	if(entity.config && entity.config.type === "service") {
		serviceBuildings.push(entity)
	}
})

Game.subscribe(Enum.Event.EntityRemove, (entity) => {
	if(entity.config && entity.config.type === "service") {
		const index = serviceBuildings.indexOf(entity)
		if(index !== -1) {
			serviceBuildings[index] = serviceBuildings[serviceBuildings.length - 1]
			serviceBuildings.pop()
		}
	}
})

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

	let entity = null
	switch(config.type) {
		case "house": 
			entity = new House(config)
			break
		case "service":
			entity = new ServiceBuilding(config)
			break
		default:
			entity = new Building(config)
			break
	}

	Game.entityPosition(entity, startX, startY)
	Game.addEntity(entity)

	store.update("state/placement")
	store.update("entities")

	PopulationService.updateFreeSpace()
}

const clear = (targetX, targetY) => {
	const map = store.data.map
	if(targetX < 0 || targetY < 0 || targetX >= map.sizeX || targetY >= map.sizeY) {
		console.error(`Invalid build cell: X:${targetX}, Y:${targetY}`)
		return
	}
	
	const entity = Game.getEntityAt(targetX, targetY)
	if(!entity) {
		console.error(`No entity at: x:${targetX} y:${targetY}`)
		return
	}

	const endX = targetX + entity.config.sizeX
	const endY = targetY + entity.config.sizeY
	for(let y = targetY; y < endY; y++) {
		for(let x = targetX; x < endX; x++) {
			const index = x + (map.sizeX * y) 
			store.set(`map/data/${index}`, Enum.Cell.Ground)
		}
	}

	Game.removeEntityAt(targetX, targetY)
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
		store.set("state/placement", {
			id: "empty",
			x: -100,
			y: -100
		})
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

const getRoadSprite = (entity) => {
	const map = store.data.map
	let sum = 0

	if(entity.x > 0) {
		const isRoad = (map.data[(entity.x - 1) + (entity.y * map.sizeX)] === Enum.Cell.Road) 
		if(isRoad) {
			sum += 2
		}
	}	
	if(entity.y > 0) {
		const isRoad = (map.data[entity.x + ((entity.y - 1) * map.sizeX)] === Enum.Cell.Road) 
		if(isRoad) {
			sum += 1
		}
	}
	if(entity.x < map.sizeX - 1) {
		const isRoad = (map.data[(entity.x + 1) + (entity.y * map.sizeX)] === Enum.Cell.Road) 
		if(isRoad) {
			sum += 4
		}
	}
	if(entity.y < map.sizeY - 1) {
		const isRoad = (map.data[entity.x + ((entity.y + 1) * map.sizeX)] === Enum.Cell.Road) 
		if(isRoad) {
			sum += 8
		}
	}

	const posX = (sum % 4 | 0) * 16
	const posY = (sum / 4 | 0) * 16
	return `-${posX}px -${posY}px`
}

const updateEntry = (entity) => {
	if(entity.entryX !== -1) {
		return
	} 
	const coords = MapService.findClosestRoad(entity)
	console.log(coords)
}

const update = (tDelta) => {
	for(let n = 0; n < serviceBuildings.length; n++) {
		const entity = serviceBuildings[n]
		updateEntry(entity)
	}
}

export default {
	build,
	useBrush,
	useSelectedBrush, selectBrush, isSpecialBrush,
	updatePlacement,
	getRoadSprite,
	update
}
