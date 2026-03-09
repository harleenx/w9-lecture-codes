'use client'
import { fetchHolidays } from "@/actions/holidays"
import { HolidayContext } from "@/contexts/HolidayContext"
import { useContext, useEffect } from "react"

export default function Holidays() {
  const { holidays, setHolidays } = useContext(HolidayContext)

  useEffect(() => {
    fetchHolidays().then(setHolidays)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Canadian Holidays</h1>
     <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Name (EN)</th>
            <th className="py-2 px-4 border-b">Name (FR)</th>
            <th className="py-2 px-4 border-b">Provinces</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td className="py-2 px-4 border-b">{holiday.date}</td>
              <td className="py-2 px-4 border-b">{holiday.nameEn}</td>
              <td className="py-2 px-4 border-b">{holiday.nameFr}</td>
              <td className="py-2 px-4 border-b">{holiday.federal ? "Federal" : 
                holiday.provinces.map((province) => province.id).join(", ")
                }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}