
const Enum = {
	Cell: {
		Grass: 0,
		Road: 1,
		House: 2,
		Well: 3
	}
}
Enum.Brush = {
	Arrow: -2,
	Clear: -1,
	Road: Enum.Cell.Road,
	House: Enum.Cell.House,
	Well: Enum.Cell.Well
}

export default Enum