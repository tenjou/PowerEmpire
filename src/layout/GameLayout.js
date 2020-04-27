import { component, componentVoid, elementOpen, elementClose, elementVoid, text, route } from "wabi"
import MapService from "../service/MapService"
import BuildingService from "../service/BuildingService"
import Enum from "../Enum"

const CellProps = {}
CellProps[Enum.Cell.Grass] = { class: "grass" }
CellProps[Enum.Cell.Road] = { class: "road" }

const HeaderResource = component({
	state: {
		icon: null,
		value: 0
	},

	render() {
		elementOpen("item")
			elementVoid("img", { src: this.$icon })
			elementOpen("amount")
				text(this.$value)
			elementClose("amount")
		elementClose("item")
	}
})

const Header = component({
	render() {
		elementOpen("header")
			componentVoid(HeaderResource, { 
				$icon: "assets/icon/gold.png", 
				bind: "resources/gold"
			})
		elementClose("header")
	}
})

const MapCell = component({
	render() {
		elementVoid("cell", CellProps[this.$value])
	}
})

const Map = component({
	mount() {
		this.props = {
			onmousemove: this.handleMouseMove.bind(this),
			onmouseup: this.handleMouseUp.bind(this)
		}
	},

	render() {
		const map = this.$value
		let index = 0

		elementOpen("map", this.props)
			for(let y = 0; y < map.sizeY; y++) {
				elementOpen("row")
					for(let x = 0; x < map.sizeX; x++) {
						componentVoid(MapCell, { bind: `map/data/${index}` })
						index++
					}
				elementClose("row")
			}
		elementClose("map")
	},

	handleMouseMove(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
	},

	handleMouseUp(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
		BuildingService.build(Enum.Cell.Road, coords[0], coords[1])
	}	
})

const GameLayout = component({
	render() {	
		elementOpen("layout")
			componentVoid(Header)

			elementOpen("game")
				componentVoid(Map, { bind: "map" })
			elementClose("game")
		elementClose("layout")
	}
})

route("/", GameLayout)