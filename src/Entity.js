import MapService from "./service/MapService"
import Vector2 from "./math/Vector2"
import Config from "./Config"

class Entity {
	constructor(config = null, onDone = null) {
		this.config = config
		this.onDone = onDone
		this.x = 0
		this.y = 0
		this.screenX = 0
		this.screenY = 0
		this.level = 0
	}
}

class Character extends Entity {
	constructor(config = null, onDone = null) {
		super(config, onDone)

		this.path = []
		this.targetX = 0
		this.targetY = 0
		this.targetScreenX = 0
		this.targetScreenY = 0
		this.hasTarget = false
		this.direction = new Vector2(0, 0)
	}
}

class Immigrant extends Character {
	constructor(config = null, onDone = null) {
		super(config, onDone)
		this.house = null
	}
}

class Building extends Entity {
	constructor(config = null, onDone = null) {
		super(config, onDone)
		this.entryX = -1
		this.entryY = -1
	}
}

class House extends Entity {
	constructor(config = null, onDone = null) {
		super(config, onDone)
		this.population = 0
		this.reservedSpace = 0
	}

	freeSpace() {
		return this.config.levels[this.level].space - this.population
	}
}

class ServiceBuilding extends Building {
	constructor(config = null, onDone = null) {
		super(config, onDone)
		this.workers = 0
		this.walker = null
	}

	workersNeeded() {
		return this.config.levels[this.level].workers - this.workers
	}
}

export {
	Entity, Character, ServiceBuilding, Immigrant, Building, House
}