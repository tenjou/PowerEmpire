import { component, elementOpen, elementClose, text, store, route } from "wabi"
import GameLayout from "./layout/GameLayout"
import MapService from "./service/MapService"
import AIService from "./service/AIService"
import TimeService from "./service/TimeService"
import Enum from "./Enum"
import Game from "./Game"

const load = () => {
	store.set("", {
		resources: {
			gold: 100,
		},
		map: null,
		state: {
			brush: Enum.Brush.Arrow
		},
		population: {
			total: 0
		},
		date: {
			day: 0,
			month: 0,
			year: 2100,
			bce: true,
			tUpdated: 0
		}
	})

	MapService.load()
	AIService.load()
	TimeService.load()
	Game.load()

	route("/", GameLayout)

	let prevTime = Date.now()
	const interval = setInterval(() => {
		const currTime = Date.now()
		const tDelta = (currTime - prevTime) / 1000

		TimeService.update()
		Game.update(tDelta)
				
		prevTime = currTime
	}, 1000 / 60)	
}

load()

window.store = store