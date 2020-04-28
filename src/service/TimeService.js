import { store } from "wabi"

const tDay = 1000
const months = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ]
const daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ]

const load = () => {
	const date = store.data.date
	date.tUpdated = Date.now()
}

const update = () => {
	const date = store.data.date
	const tCurrent = Date.now()
	const tPassed = tCurrent - date.tUpdated
	const daysPassed = tPassed / tDay | 0
	if(daysPassed > 0) {
		date.day += daysPassed
		date.tUpdated = tCurrent - (tPassed - (daysPassed * tDay))
		while(date.day >= daysInMonth[date.month]) {
			date.day -= daysInMonth[date.month]
			date.month++
			if(date.month >= months.length) {
				date.month = 0
				date.year = date.bce ? (date.year - 1) : (date.year + 1)
				if(date.year === 0) {
					date.bce = false
				}
			}
		}
		store.update("date")
	}
}

const getDateString = () => {
	const date = store.data.date
	return `${date.day + 1} ${months[date.month]} ${date.year} BCE`
}

export default {
	load, update,
	getDateString
}