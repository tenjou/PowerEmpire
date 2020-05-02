import { store } from "wabi"
import AIService from "./service/AIService"
import MapService from "./service/MapService"
import Character from "./Character"
import db from "../assets/db.json"

const entities = []
const entitySpeed = 60


const load = () => {
	// const entitiesSpawn = 10
	// for(let n = 0; n < entitiesSpawn; n++) {
	// 	const x = MapService.randomGridX()
	// 	const y = MapService.randomGridY()
	// 	spawn(x, y)
	// }

	store.set("entities", entities)
}

const update = (tDelta) => {
	for(let n = 0; n < entities.length; n++) {
		const entity = entities[n]
		if(entity instanceof Character) {
			updateEntity(entity, tDelta, n)
		}
	}
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
		entity.target(nextTarget.x, nextTarget.y)
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

const spawn = (x, y) => {
	const entity = new Character()
	entity.move(x, y)
	entities.push(entity)
}

const addEntity = (entity) => {
	entities.push(entity)
	store.update("entities")
}

export default {
	load, update, addEntity
}