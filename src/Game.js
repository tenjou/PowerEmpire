import { store } from "wabi"
import AIService from "./service/AIService"
import MapService from "./service/MapService"
import Vector2 from "./math/Vector2"

const entities = []
const entitySpeed = 60
const entityOffset = 8

function Entity(x, y) {
	this.x = 0
	this.y = 0
	this.screenX = 0
	this.screenY = 0

	this.path = []
	this.targetX = 0
	this.targetY = 0
	this.targetScreenX = 0
	this.targetScreenY = 0
	this.hasTarget = false

	this.direction = new Vector2(0, 0)
}

const load = () => {
	const entitiesSpawn = 10
	for(let n = 0; n < entitiesSpawn; n++) {
		const x = MapService.randomGridX()
		const y = MapService.randomGridY()
		spawn(x, y)
	}
	store.set("entities", entities)
}

const update = (tDelta) => {
	for(let n = 0; n < entities.length; n++) {
		updateEntity(entities[n], tDelta)
	}
	store.update("entities")
}

const updateEntity = (entity, tDelta) => {
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
		entity.targetX = nextTarget.x
		entity.targetY = nextTarget.y	
		if(entity.x !== nextTarget.x && entity.y !== nextTarget.y) {
			console.log("here")
		} 

		const screenCoords = MapService.getScreenCoords(entity.targetX, entity.targetY)
		entity.targetScreenX = screenCoords[0] + entityOffset
		entity.targetScreenY = screenCoords[1] + entityOffset
		entity.hasTarget = true
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

const teleport = (entity, x, y) => {
	const screenCoords = MapService.getScreenCoords(x, y)
	entity.x = x
	entity.y = y
	entity.targetX = x
	entity.targetY = y
	entity.screenX = screenCoords[0] + entityOffset
	entity.screenY = screenCoords[1] + entityOffset
}

const spawn = (x, y) => {
	const entity = new Entity()
	teleport(entity, x, y)
	entities.push(entity)
}

export default {
	load, update
}