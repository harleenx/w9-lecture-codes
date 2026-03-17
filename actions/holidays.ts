'use server'

export interface Holiday {
  id: number
  date: string
  nameEn: string
  nameFr: string
  federal: boolean
  provinces: {
    id: string
  }[]
}

export const fetchHolidays = async (year = 2024): Promise<Holiday[]> => {
  const response = await fetch(
    `https://canada-holidays.ca/api/v1/holidays?year=${year}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch holidays for ${year}`)
  }

  const data = await response.json()
  return data.holidays
}
