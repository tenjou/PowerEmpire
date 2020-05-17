import { store } from "wabi"
import AIService from "./AIService"
import { Immigrant } from "../Entity"
import Config from "../Config"
import Game from "../Game"

let immigrationAccumulator = 0
let immigrationStartX = 0
let immigrationStartY = 0
let needUpdateWorkers = false

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

	if(needUpdateWorkers) {
		updateWorkers()
		needUpdateWorkers = false
	}
}

const updateFreeSpace = () => {
	let totalFreeSpace = 0

	const houses = store.data.entitiesHouses
	for(let n = 0; n < houses.length; n++) {
		const house = houses[n]
		if(house.entryX !== -1) {
			const freeSpace = house.freeSpace()
			totalFreeSpace += freeSpace
		}
	}

	store.set("population/totalMax", store.data.population.total + totalFreeSpace)
	store.set("population/freeSpace", totalFreeSpace)
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

const updateWorkers = () => {
	const workers = store.data.population.workers
	const services = store.data.entitiesServices
	const workersRatio = workers / store.data.population.workersNeed

	let workersLeft = workers
	for(let n = 0; n < services.length; n++) {
		const service = services[n]
		const workersAssigned = Math.min(Math.ceil(service.config.workers * workersRatio), service.config.workers)
		service.workers = Math.min(workersAssigned, workersLeft)
		workersLeft -= service.workers
		if(workersLeft <= 0) {
			break
		}
	}

	store.set("population/workersUsed", workers - workersLeft)
}

const updateWorkersNeed = () => {
	let workersNeed = 0

	const services = store.data.entitiesServices
	for(let n = 0; n < services.length; n++) {
		const entity = services[n]
		if(entity.entryX !== -1) {
			workersNeed += entity.config.workers
		}
	}

	needUpdateWorkers = true

	store.set("population/workersNeed", workersNeed)
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
			targetEntity.targetLevel = 1
		}

		const freeSpace = targetEntity.freeSpace()
		const populationAdded = (freeSpace > Config.immigrantPopulation) ? Config.immigrantPopulation : freeSpace
		targetEntity.population += populationAdded
		targetEntity.reservedSpace -= Config.immigrantPopulation

		const population = store.data.population
		population.total += populationAdded
		population.freeSpace -= populationAdded
		population.immigrants -= Config.immigrantPopulation
		population.workers = population.total * Config.workerPercentage | 0
		population.totalMax = population.total + population.freeSpace
		store.update("population")

		needUpdateWorkers = true
	}
}

export default {
	update, updateFreeSpace, updateWorkersNeed
}