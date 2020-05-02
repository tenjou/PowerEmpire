import { component, componentVoid, elementOpen, elementClose, elementVoid, text, route } from "wabi"
import MapService from "../service/MapService"
import BuildingService from "../service/BuildingService"
import TimeService from "../service/TimeService"
import Enum from "../Enum"
import db from "../../assets/db.json"

const CellProps = {}
CellProps[Enum.Cell.Ground] = { class: "grass" }
CellProps[Enum.Cell.Water] = { class: "water" }
CellProps[Enum.Cell.Building] = { class: "building" }
CellProps[Enum.Cell.Road] = { class: "road" }

const HeaderResource = component({
	state: {
		icon: null,
		value: 0
	},

	render() {
		elementOpen("item")
			elementVoid("img", { src: this.$icon })
			elementOpen("value")
				text(this.$value)
			elementClose("value")
		elementClose("item")
	}
})

const HeaderItem = component({
	state: {
		icon: null,
		value: 0
	},

	render() {
		elementOpen("item")
			elementOpen("icon")
				elementVoid("i", { class: this.$icon })
			elementClose("icon")

			elementOpen("value")
				text(this.$value)
			elementClose("value")
		elementClose("item")
	}
})

const HeaderDate = component({
	render() {
		elementOpen("item")
			elementOpen("value")
				text(TimeService.getDateString())
			elementClose("value")
		elementClose("item")
	}
})

const Header = component({
	render() {
		elementOpen("header")
			componentVoid(HeaderItem, {
				$icon: "fas fa-user",
				bind: "population/total"
			})
			componentVoid(HeaderResource, { 
				$icon: "assets/icon/gold.png", 
				bind: "resources/gold"
			})
			componentVoid(HeaderDate, {
				bind: "date"
			})
		elementClose("header")
	}
})

const Brushes = component({
	mount() {
		this.bind = "state/brush"
		this.handleClickFunc = this.handleClick.bind(this)
	},

	render() {
		elementOpen("brushes")
			this.renderBrush("arrow")
			this.renderBrush("clear")
			this.renderBrush("road")
			this.renderBrush("house")
			this.renderBrush("well")
			this.renderBrush("hunting_hut")
		elementClose("brushes")
	},

	renderBrush(id) {
		elementOpen("brush", {
			"data-id": id,
			class: (this.$value === id) ? "active" : null,
			onclick: this.handleClickFunc
		})
			text(id)
		elementClose("brush")
	},

	handleClick(event) {
		const brushId = event.currentTarget.dataset.id
		BuildingService.selectBrush(brushId)
	}
})

const MapCell = component({
	render() {
		elementVoid("cell", CellProps[this.$value])
	}
})

const MapEntity = component({
	render() {
		const entity = this.$value
		if(entity.config) {
			switch(entity.config.type) {
				case "building":
					elementOpen("entity", {
						style: {
							left: entity.screenX + "px",
							top: entity.screenY + "px"
						}
					})
						elementVoid("img", { src: entity.config.levels[entity.level].sprite })
					elementClose("entity")							
					break

				case "road":
					elementOpen("entity", {
						style: {
							left: entity.screenX + "px",
							top: entity.screenY + "px"
						}
					})
						elementVoid("img", { 
							src: entity.config.levels[entity.level].tileset,
							style: {
								objectPosition: BuildingService.getRoadSprite(entity)
							}
						})
					elementClose("entity")
					break
			}
		}
		else {
			elementOpen("entity", {
				style: {
					left: entity.screenX + "px",
					top: entity.screenY + "px"
				}
			})	
				elementVoid("player")
			elementClose("entity")
		}
	}
})

const MapEntities = component({
	render() {
		const entities = this.$value

		elementOpen("entities")
			for(let n = 0; n < entities.length; n++) {
				componentVoid(MapEntity, { bind: `${this.bind}/${n}`})
			}
		elementClose("entities")
	}
})

const BuildingPlacement = component({
	render() {
		const state = this.$value
		if(!state.id) {
			return
		}
		const config = db.assets.entities[state.id]
		const coords = MapService.getScreenCoords(state.x, state.y)
		elementOpen("placement", {
			style: {
				left: coords[0] + "px",
				top: coords[1] + "px"
			}
		})
			for(let y = 0; y < config.sizeY; y++) {
				elementOpen("row")
					for(let x = 0; x < config.sizeX; x++) {
						elementVoid("cell", { 
							class: MapService.isCellFree(state.x + x, state.y + y) ? "" : "invalid"
						})
					}
				elementClose("row")
			}
		elementClose("placement")
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

			componentVoid(MapEntities, { bind: "entities" })
			componentVoid(BuildingPlacement, { bind: "state/placement" })
		elementClose("map")
	},

	handleMouseMove(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
		BuildingService.updatePlacement(inputX, inputY)
	},

	handleMouseUp(event) {
		const inputX = event.clientX - event.currentTarget.offsetLeft
		const inputY = event.clientY - event.currentTarget.offsetTop
		const coords = MapService.getCoords(inputX, inputY)
		BuildingService.useSelectedBrush(coords[0], coords[1])
	}	
})

const GameLayout = component({
	render() {	
		elementOpen("layout")
			componentVoid(Header)
			componentVoid(Brushes)

			elementOpen("game")
				componentVoid(Map, { bind: "map" })
			elementClose("game")
		elementClose("layout")
	}
})

route("/", GameLayout)