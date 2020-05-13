import { store } from "wabi"
import AIService from "./service/AIService"
import MapService from "./service/MapService"
import { Character } from "./Entity"
import Config from "./Config"
import db from "../assets/db.json"

const listeners = {}
const entities = []
const entitiesHouses = []
const entitiesServices = []
const entitiesRemove = []
const entitiesGrid = []
const entitySpeed = 60

const load = () => {
	const map = store.data.map
	entitiesGrid.length = map.sizeX * map.sizeY

	entities.length = 0
	entitiesHouses.length = 0
	entitiesServices.length = 0
	store.set("entities", entities)
	store.set("entitiesHouses", entitiesHouses)
	store.set("entitiesServices", entitiesServices)
}

const update = (tDelta) => {
	if(entitiesRemove.length > 0) {
		for(let n = 0; n < entitiesRemove.length; n++) {
			removeEntityImmediate(entitiesRemove[n])
		}
		entitiesRemove.length = 0
	}

	for(let n = 0; n < entities.length; n++) {
		const entity = entities[n]
		if(entity instanceof Character) {
			updateEntity(entity, tDelta)
		}
	}

	store.update("entities")
}

const updateEntity = (entity, tDelta) => {
	if(!entity.hasTarget) {
		if(entity.path.length === 0) {
			if(entity.onDone) {
				entity.onDone(entity)
			}
			if(entity.path.length === 0) {
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

const addEntity = (entity) => {
	entities.push(entity)
	if(entity.config) {
		switch(entity.config.type) {
			case "house":
				entitiesHouses.push(entity)
				break
			case "service":
				entitiesServices.push(entity)
				break
		}
	}
	store.update("entities")
}

const removeEntityImmediate = (entity) => {
	const index = entities.indexOf(entity)
	if(index !== -1) {
		entities[index] = entities[entities.length - 1]
		entities.pop()
	}

	if(entity.config) {
		let buffer = null

		switch(entity.config.type) {
			case "house":
				buffer = entitiesHouses				
				break
			case "service":
				buffer = entitiesServices
				break
		}

		if(buffer) {
			const index = buffer.indexOf(entity)
			if(index !== -1) {
				buffer[index] = buffer[buffer.length - 1]
				buffer.pop()
			}
		}
	}
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

const subscribe = (type, func) => {
	const funcs = listeners[type]
	if(funcs) {
		funcs.push(func)
	}
	else {
		listeners[type] = [ func ]
	}
}

const unsubscribe = (type, func) => {
	const funcs = listeners[type]
	if(!funcs) {
		return
	}
	const index = funcs.indexOf(func)
	funcs[index] = funcs[funcs.length - 1]
	funcs.pop()
}

const emit = (type, arg) => {
	const funcs = listeners[type]
	if(!funcs) {
		return
	}
	for(let n = 0; n < funcs.length; n++) {
		funcs[n](arg)
	}
}

export default {
	load, update, addEntity,
	entityPosition,
	removeEntity, removeEntityAt, getEntityAt,
	subscribe, unsubscribe, emit
}