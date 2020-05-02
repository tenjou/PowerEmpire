import { store } from "wabi"
import AStar from "../AStar"
import Enum from "../Enum"

let astar = null
const options = new AStar.Options(Enum.Cell.Grass | Enum.Cell.Road)

const load = () => {
	const map = store.data.map
	astar = new AStar(map.data, map.sizeX, map.sizeY)
}

const search = (startX, startY, endX, endY, output) => {
	return astar.search(startX, startY, endX, endY, output, options)
}

export default {
	load, search
}