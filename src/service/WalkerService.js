import Game from "../Game"
import Enum from "../Enum"

const walkers = []

Game.subscribe(Enum.Event.EntityAdd, (entity) => {
	// if(entity.config && entity.config.type === "service") {
	// 	walkers.push(entity)
	// }
})

Game.subscribe(Enum.Event.EntityRemove, (entity) => {
	// if(entity.config && entity.config.type === "service") {
	// 	const index = serviceBuildings.indexOf(entity)
	// 	if(index !== -1) {
	// 		walkers[index] = serviceBuildings[serviceBuildings.length - 1]
	// 		walkers.pop()
	// 	}
	// }
})

export {}