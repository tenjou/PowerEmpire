import { store } from "wabi"
import AIService from "./service/AIService"
import MapService from "./service/MapService"
import { Character } from "./Entity"
import Config from "./Config"
import db from "../assets/db.json"

const entities = []
const entitiesRemove = []
const entitiesGrid = []
const entitySpeed = 60

const load = () => {
	const map = store.data.map
	entitiesGrid.length = map.sizeX * map.sizeY

	store.set("entities", entities)
}

const update = (tDelta) => {
	if(entitiesRemove.length > 0) {
		for(let n = 0; n < entitiesRemove.length; n++) {
			const entity = entitiesRemove[n]
			const index = entities.indexOf(entity)
			if(index === -1) {
				continue
			}
			entities[index] = entities[entities.length - 1]
			entities.pop()
		}
		entitiesRemove.length = 0
		store.update("entities")
	}

	for(let n = 0; n < entities.length; n++) {
		const entity = entities[n]
		if(entity instanceof Character) {
			updateEntity(entity, tDelta, n)
		}
	}
}

const entityPosition = (entity, x, y) => {
	const screenCoords = MapService.getScreenCoords(x, y)
	entity.x = x
	entity.y = y
	entity.screenX = screenCoords[0] + Config.entityOffset
	entity.screenY = screenCoords[1] + Config.entityOffset

	if(entity instanceof Character) {
		entity.targetX = x
		entity.targetY = y
	}

	const index = x + (y * store.data.map.sizeX)
	entitiesGrid[index] = entity
}

const entityTarget = (entity, targetX, targetY) => {
	entity.targetX = targetX
	entity.targetY = targetY
	if(entity.x !== targetX && entity.y !== targetY) {
		console.warn("movement-error")
	} 

	const screenCoords = MapService.getScreenCoords(entity.targetX, entity.targetY)
	entity.targetScreenX = screenCoords[0] + Config.entityOffset
	entity.targetScreenY = screenCoords[1] + Config.entityOffset
	entity.hasTarget = true
}

const updateEntity = (entity, tDelta, id) => {
	if(!entity.hasTarget) {
		if(entity.path.length === 0) {
			if(!AIService.search(
				entity.x, entity.y, 
				MapService.randomGridX(), MapService.randomGridY(),
				entity.path)) 
			{
				return	
			}
		}

		const nextTarget = entity.path.pop()
		entityTarget(entity, nextTarget.x, nextTarget.y)
	}

	if(entity.hasTarget) {
		let speed = entitySpeed * tDelta

		entity.direction.set(entity.targetScreenX - entity.screenX, entity.targetScreenY - entity.screenY)
		const distance = entity.direction.length()
		if(distance < speed) {
			speed = distance
			entity.x = entity.targetX
			entity.y = entity.targetY
			entity.screenX = entity.targetScreenX
			entity.screenY = entity.targetScreenY
			entity.hasTarget = false
		}
		else {
			entity.direction.normalize()
			entity.screenX += entity.direction.x * speed
			entity.screenY += entity.direction.y * speed
		}
	}

	store.update(`entities/${id}`)
}

const addEntity = (entity) => {
	entities.push(entity)
	store.update("entities")
}

const removeEntity = (entity) => {
	entitiesRemove.push(entity)
}

const removeEntityAt = (x, y) => {
	const index = x + (y * store.data.map.sizeX)
	const entity = entitiesGrid[index]
	if(entity) {
		removeEntity(entity)
	}
}

const getEntityAt = (x, y) => {
	const index = x + (y * store.data.map.sizeX)
	const entity = entitiesGrid[index]
	return entity || null
}

export default {
	load, update, addEntity,
	entityPosition,
	removeEntity, removeEntityAt, getEntityAt
}