'use server'

export const fetchHolidays = async () => {
    const response = await fetch("https://canada-holidays.ca/api/v1/holidays")
    const data = await response.json()
    return data.holidays
}
