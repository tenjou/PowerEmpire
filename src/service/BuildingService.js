import { store } from "wabi" 

const build = (type, x, y) => {
	const map = store.data.map
	if(x < 0 || y < 0 || x >= map.sizeX || y >= map.sizeY) {
		console.error(`Invalid build cell: X:${x}, Y:${y}`)
		return
	}
	const index = x + (map.sizeX * y) 
	store.set(`map/data/${index}`, type)
}

export default {
	build
}