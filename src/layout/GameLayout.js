import { component, componentVoid, elementOpen, elementClose, elementVoid, text, route } from "wabi"
import MapService from "../service/MapService"

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