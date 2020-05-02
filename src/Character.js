import Entity from "./Entity"
import MapService from "./service/MapService"
import Vector2 from "./math/Vector2"
import Config from "./Config"

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

	move(x, y) {
		super.move(x, y)
		this.targetX = x
		this.targetY = y
	}

	target(targetX, targetY) {
		this.targetX = targetX
		this.targetY = targetY
		if(this.x !== targetX && this.y !== targetY) {
			console.log("here")
		} 

		const screenCoords = MapService.getScreenCoords(this.targetX, this.targetY)
		this.targetScreenX = screenCoords[0] + Config.entityOffset
		this.targetScreenY = screenCoords[1] + Config.entityOffset
		this.hasTarget = true
	}
}

export default Character