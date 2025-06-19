export const getDaysBetweenDates = (date1, date2) => {
  const startDate = new Date(date1)
  const endDate = new Date(date2)
  const differenceInMillis = endDate - startDate

  return differenceInMillis / (1000 * 60 * 60 * 24) || 0 // Convert milliseconds to days
}

export const createDateArray = (sDate, eDate) => {
  const dateArray = []
  let dateDay = 1

  const endDate = new Date(eDate)
  let currentDate = new Date(sDate)

  while (currentDate <= endDate) {
    const thisDay = {
      day: dateDay,
      date: currentDate.toISOString().split('T')[0],
    }
    dateArray.push(thisDay)
    currentDate.setDate(currentDate.getDate() + 1) // Add 1 day

    ++dateDay
  }

  return dateArray
}
