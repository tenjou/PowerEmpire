import { store } from "wabi" 
import Enum from "../Enum"

const build = (type, x, y) => {
	const map = store.data.map
	if(x < 0 || y < 0 || x >= map.sizeX || y >= map.sizeY) {
		console.error(`Invalid build cell: X:${x}, Y:${y}`)
		return
	}
	const index = x + (map.sizeX * y) 
	store.set(`map/data/${index}`, type)
}

const clear = (x, y) => {
	const map = store.data.map
	if(x < 0 || y < 0 || x >= map.sizeX || y >= map.sizeY) {
		console.error(`Invalid build cell: X:${x}, Y:${y}`)
		return
	}
	const index = x + (map.sizeX * y) 
	store.set(`map/data/${index}`, Enum.Cell.Grass)
}

const useBrush = (brush, x, y) => {
	if(brush === Enum.Brush.Arrow) {
		return
	}

	if(brush === Enum.Brush.Clear) {
		clear(x, y)
	}
	else {
		build(brush, x, y)
	}
}

const useSelectedBrush = (x, y) => {
	useBrush(store.data.state.brush, x, y)
}

const selectBrush = (brush) => {
	store.set("state/brush", brush)
}

export default {
	build,
	useBrush,
	useSelectedBrush, selectBrush
}