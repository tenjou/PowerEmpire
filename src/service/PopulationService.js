import { store } from "wabi"
import AIService from "./AIService"
import { Immigrant } from "../Entity"
import Config from "../Config"
import Game from "../Game"

let immigrationAccumulator = 0
let immigrationStartX = 0
let immigrationStartY = 0

const update = (tDelta) => {
	const population = store.data.population
	if(population.freeSpace > population.immigrants) {
		immigrationAccumulator += Config.immigrationRate * tDelta 
		if(immigrationAccumulator > Config.immigrantPopulation) {
			immigrationAccumulator -= Config.immigrantPopulation
			spawnImmigrant()
		}
	}
	else {
		immigrationAccumulator = 0
	}
}

const updateFreeSpace = () => {
	let freeSpace = 0

	const entities = store.data.entities
	for(let n = 0; n < entities.length; n++) {
		const entity = entities[n]
		if(entity.config && entity.config.type === "house") {
			freeSpace += entity.freeSpace()
		}
	}

	store.set("population/freeSpace", freeSpace)
}

const getFreeHouse = () => {
	const entities = store.data.entities
	for(let n = 0; n < entities.length; n++) {
		const entity = entities[n]
		if(entity.config && entity.config.type === "house") {
			if((entity.population + entity.reservedSpace) < entity.config.levels[entity.level].space) {
				return entity
			}
		}
	}
	return null	
}

const spawnImmigrant = () => {
	const house = getFreeHouse()
	if(!house) {
		console.error("no-free-house-found")
		return
	}

	const immigrant = new Immigrant(null, handleImmigratReached)
	Game.entityPosition(immigrant, immigrationStartX, immigrationStartY)
	Game.addEntity(immigrant)
	immigrant.house = house
	house.reservedSpace += Config.immigrantPopulation

	if(!AIService.search(immigrant.x, immigrant.y, house.x, house.y, immigrant.path)) {
		console.error("immigrant-no-path-found")
	}

	store.data.population.immigrants += Config.immigrantPopulation
}

const handleImmigratReached = (entity) => {
	Game.removeEntity(entity)

	const targetEntity = Game.getEntityAt(entity.house.x, entity.house.y)
	if(targetEntity) {
		if(targetEntity.level === 0) {
			targetEntity.level = 1
		}

		const freeSpace = targetEntity.freeSpace()
		const populationAdded = (freeSpace > Config.immigrantPopulation) ? Config.immigrantPopulation : freeSpace
		targetEntity.population += populationAdded
		targetEntity.reservedSpace -= Config.immigrantPopulation

		const population = store.data.population
		population.total += populationAdded
		population.freeSpace -= populationAdded
		population.immigrants -= Config.immigrantPopulation
		store.update("population")
	}
}

export default {
	update, updateFreeSpace
}