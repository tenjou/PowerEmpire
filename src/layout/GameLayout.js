import { component, componentVoid, elementOpen, elementClose, elementVoid, text, route } from "wabi"
import MapService from "../service/MapService"

const Map = component({
	mount() {
		this.props = {
			onmousemove: this.handleMouseMove.bind(this)
		}
	},

	render() {
		const map = this.$value

		elementOpen("map", this.props)
			for(let y = 0; y < map.sizeY; y++) {
				elementOpen("row")
					for(let x = 0; x < map.sizeX; x++) {
						this.renderCell()
					}
				elementClose("row")
			}
		elementClose("map")
	},

	renderCell() {
		elementVoid("cell", { class: "grass" })
	},

	handleMouseMove(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
		console.log(coords)
	}
})

const GameLayout = component({
	render() {	
		elementOpen("layout")
			elementOpen("game")
				componentVoid(Map, { bind: "map" })
			elementClose("game")
		elementClose("layout")
	}
})

route("/", GameLayout)