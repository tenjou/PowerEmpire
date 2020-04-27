import { component, elementOpen, elementClose, text, route } from "wabi"

const Map = component({
	render() {
		elementOpen("map")
			
		elementClose("map")
	}
})

const GameLayout = component({
	render() {	
		elementOpen("layout")
			elementOpen("game")
			elementClose("game")
		elementClose("layout")
	}
})

route("/", GameLayout)