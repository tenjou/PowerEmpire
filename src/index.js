import { component, elementOpen, elementClose, text, store, route } from "wabi"
import GameLayout from "./layout/GameLayout"
import MapService from "./service/MapService"
import Enum from "./Enum"

const load = () => {
	store.set("", {
		resources: {
			gold: 100,
		},
		map: null,
		state: {
			brush: Enum.Brush.Arrow
		}
	})

	MapService.load()

	route("/", GameLayout)
}

load()

window.store = store