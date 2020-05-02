import MapService from "./service/MapService"
import Config from "./Config"

class Entity {
	constructor(config) {
		this.config = config
		this.x = 0
		this.y = 0
		this.screenX = 0
		this.screenY = 0
	}

	move(x, y) {
		const screenCoords = MapService.getScreenCoords(x, y)
		this.x = x
		this.y = y
		this.screenX = screenCoords[0] + Config.entityOffset
		this.screenY = screenCoords[1] + Config.entityOffset
	}
}

export default Entity