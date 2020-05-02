import Entity from "./Entity"

class Building extends Entity {
	constructor(config) {
		super(config)
		this.level = 0
	}
}

export default Building