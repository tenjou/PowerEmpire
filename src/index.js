import { component, elementOpen, elementClose, text, store, route } from "wabi"
import GameLayout from "./layout/GameLayout"
import MapService from "./service/MapService"
import AIService from "./service/AIService"
import TimeService from "./service/TimeService"
import PopulationService from "./service/PopulationService"
import BuildingService from "./service/BuildingService"
import WalkerService from "./service/WalkerService"
import Enum from "./Enum"
import Game from "./Game"

const load = () => {
	store.set("", {
		resources: {
			gold: 100,
		},
		map: null,
		state: {
			brush: "arrow",
			placement: {
				id: null,
				x: 0,
				y: 0
			}
		},
		population: {
			total: 0,
			totalMax: 0,
			workers: 0,
			freeSpace: 0,
			immigrants: 0
		},
		date: {
			day: 0,
			month: 0,
			year: 2100,
			bce: true,
			tUpdated: 0
		},
		entities: null,
		houses: null,
		services: null
	})

	MapService.load()
	AIService.load()
	TimeService.load()
	Game.load()

	route("/", GameLayout)

	let prevTime = Date.now()
	let prevTime2 = Date.now()

	const interval = setInterval(() => {
		const currTime = Date.now()
		const tDelta = (currTime - prevTime) / 1000

		TimeService.update()
		Game.update(tDelta)
		PopulationService.update(tDelta)
				
		prevTime = currTime
	}, 1000 / 60)

	const interval2 = setInterval(() => {
		const currTime = Date.now()
		const tDelta = (currTime - prevTime) / 1000

		BuildingService.update(tDelta)
				
		prevTime2 = currTime
	}, 1000)
}

load()

window.store = store