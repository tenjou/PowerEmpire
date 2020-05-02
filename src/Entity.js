import MapService from "./service/MapService"
import Vector2 from "./math/Vector2"
import Config from "./Config"

class Entity {
	constructor(config = null) {
		this.config = config
		this.x = 0
		this.y = 0
		this.screenX = 0
		this.screenY = 0
	}
}

class Character extends Entity {
	constructor() {
		super()

		this.path = []
		this.targetX = 0
		this.targetY = 0
		this.targetScreenX = 0
		this.targetScreenY = 0
		this.hasTarget = false
		this.direction = new Vector2(0, 0)
	}
}

class Building extends Entity {
	constructor(config) {
		super(config)

		this.level = 0
	}
}

export {
	Entity, Character, Building
}