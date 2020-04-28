
function AStarNode(x, y) {
	this.parent = null
	this.searchIndex = 0
	this.depth = 0
	this.x = x
	this.y = y
	this.h = 0
	this.g = 0
	this.f = 0
}

function AStarOptions(walkable = 0, diagonal = false, range = 0, cost = null) {
	this.walkable = walkable
	this.diagonal = diagonal
	this.range = range
	this.cost = cost
}

class AStar {
	constructor(data, sizeX, sizeY) {
		this.data = null
		this.nodes = null
		this.sizeX = 0
		this.sizeY = 0

		this.open = null
		this.numOpen = 0
		this.searchIndex = 0
		this.endNode = null

		this._options = null
		this._heuristic = null
		this._cost = 0

		this.setup(data, sizeX, sizeY)
	}

	setup(data, sizeX, sizeY) {
		this.data = data
		this.sizeX = sizeX
		this.sizeY = sizeY

		const numTiles = sizeX * sizeY
		if(!this.open) {
			this.open = new Array(numTiles)
			this.nodes = new Array(numTiles)
		}
		else if(this.open.length !== numTiles) {
			this.open.length = numTiles
			this.nodes.length = numTiles
		}

		let index = 0
		for(let y = 0; y < sizeY; y++) {
			for(let x = 0; x < sizeX; x++) {
				this.nodes[index++] = new AStarNode(x, y)
			}
		}
	}

	search(startX, startY, endX, endY, output, options) {
		const startNode = this.getNode(startX, startY)
		if(startNode === null) { return false }

		const endNode = this.getNode(endX, endY)
		if(endNode === null) { return false }

		if(startNode == endNode) {
			output.length = 1
			output[0] = startNode
			return true
		}

		this._options = options
		if(options.diagonal) {
			this._heuristicFunc = euclidean
			this._costFunc = euclideanCost
		}
		else {
			this._heuristicFunc = manhattan
			this._costFunc = manhattanCost
		}

		this.searchIndex++
		this.numOpen = 1
		this.open[0] = startNode
		this.endNode = endNode

		startNode.parent = null
		startNode.searchIndex = this.searchIndex
		startNode.depth = 0
		startNode.h = this._heuristicFunc(startNode, endNode)
		startNode.g = 0

		this.startNode = startNode

		while(this.numOpen > 0) {
			let parentNode = this.open[0]
			let index = 0

			for(let n = 1; n < this.numOpen; n++) {
				const node = this.open[n]
				if(node.f < parentNode.f) {
					parentNode = node
					index = n
				}
			}

			this.numOpen--
			this.open[index] = this.open[this.numOpen]

			if(parentNode === this.endNode || parentNode.h <= this._options.range) {
				this.generatePath(parentNode, output, this._options.range)
				return true
			}

			if(options.diagonal) {
				this.loadNeighborsDiagonal(parentNode.x, parentNode.y, parentNode)
			}
			else {
				this.loadNeighbors(parentNode.x, parentNode.y, parentNode)
			}
		}

		output.length = 0
		return false
	}	

	loadNeighbors(x, y, parentNode) {
		if(x > 0) {
			this.tryAddNeighbor(x - 1, y, parentNode)
		}		
		if(y > 0) {
			this.tryAddNeighbor(x, y - 1, parentNode)
		}
		if(x < this.sizeX - 1) {
			this.tryAddNeighbor(x + 1, y, parentNode)
		}	
		if(y < this.sizeY - 1) {
			this.tryAddNeighbor(x, y + 1, parentNode)
		}			
	}

	loadNeighborsDiagonal(x, y, parentNode) {	
		if(x > 0) {
			this.tryAddNeighbor(x - 1, y, parentNode)
		}		
		if(y > 0) {
			this.tryAddNeighbor(x, y - 1, parentNode)
		}
		if(x < this.sizeX - 1) {
			this.tryAddNeighbor(x + 1, y, parentNode)
		}	
		if(y < this.sizeY - 1) {
			this.tryAddNeighbor(x, y + 1, parentNode)
		}	
		if((x > 0) && (y > 0)) {
			this.tryAddNeighbor(x - 1, y - 1, parentNode)
		}
		if((x < this.sizeX - 1) && (y > 0)) {
			this.tryAddNeighbor(x + 1, y - 1, parentNode)
		}
		if((x > 0) && (y < this.sizeY - 1)) {
			this.tryAddNeighbor(x - 1, y + 1, parentNode)
		}
		if((x < this.sizeX - 1) && (y < this.sizeY - 1)) {
			this.tryAddNeighbor(x + 1, y + 1, parentNode)
		}
	}

	tryAddNeighbor(x, y, parentNode) {
		const node = this.getNode(x, y)
		const id = x + (y * this.sizeX)
		const gid = this.data[id]
		if(node.searchIndex != this.searchIndex && (this._options.walkable & gid) === gid) {
			node.parent = parentNode
			node.h = this._heuristicFunc(node, this.endNode)
			node.g = parentNode.g + this._costFunc(node, parentNode)
			if(this._options.cost) {
				node.g += this._options.cost[id]
			}
			node.f = node.g + node.h
			node.searchIndex = this.searchIndex
			node.depth = parentNode.depth + 1
			this.open[this.numOpen++] = node
		} 
		return null
	}

	generatePath(node, output, range) {
		const depth = node.depth

		if(range > 0) {
			output.length = 0
			for(let n = 0; n < depth; n++) {
				if(node.h >= range) {
					output.push(node)
				}
				node = node.parent
			}
		}
		else {
			output.length = depth
			for(let n = 0; n < depth; n++) {
				output[n] = node
				node = node.parent
			}			
		}
	}

	getNode(x, y) {
		const index = x + (y * this.sizeX)
		const node = this.nodes[index]
		return node || null
	}
}

AStar.Options = AStarOptions

const manhattan = (node, destNode) => {
	const dx = node.x - destNode.x
	const dy = node.y - destNode.y
	return ((dx ^ (dx >> 31)) - (dx >> 31)) + 
		   ((dy ^ (dy >> 31)) - (dy >> 31))
}

const manhattanCost = (node, parentNode, cost) => {
	return 1
}

// magicNumber: D2 - 2 * D
const euclideanMagicNumber = -0.5857864376269049
const euclidean = (node, destNode) => {
	const dx = node.x - destNode.x
	const dy = node.y - destNode.y
	return ((dx ^ (dx >> 31)) - (dx >> 31)) + 
		   ((dy ^ (dy >> 31)) - (dy >> 31)) + 
		   euclideanMagicNumber * Math.min(dx, dy)
}

const euclideanCost = (node, parentNode, cost) => {
	if(node.x !== parentNode.x && node.y !== parentNode.y) {
		return 1.42
	}
	return 1
}

export default AStar