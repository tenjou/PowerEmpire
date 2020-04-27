import { component, elementOpen, elementClose, text, store, route } from "wabi"
import GameLayout from "./layout/GameLayout"
import MapService from "./service/MapService"

const load = () => {
	store.set("", {
		resources: {
			gold: 100,
		},
		map: null
	})

	MapService.load()

	route("/", GameLayout)
}

load()

window.store = store