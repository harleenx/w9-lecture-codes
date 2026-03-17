'use client'

import { fetchHolidays, type Holiday } from "@/actions/holidays"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const DEFAULT_YEAR = 2024
const MIN_YEAR = 2020
const MAX_YEAR = 2030
const PAGE_SIZE = 10
const ALL_PROVINCES = "ALL"

const YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, index) => MIN_YEAR + index
)

const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
]

const parseYear = (value: string | null) => {
  const year = Number(value)
  return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR
    ? year
    : DEFAULT_YEAR
}

const parseProvince = (value: string | null) => {
  if (!value) {
    return ALL_PROVINCES
  }

  const province = value.toUpperCase()
  return PROVINCES.includes(province) ? province : ALL_PROVINCES
}

const parsePage = (value: string | null) => {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

const getProvinceLabel = (holiday: Holiday) => {
  if (holiday.federal) {
    return "Federal"
  }

  return holiday.provinces.map((province) => province.id).join(", ")
}

export default function HolidaysClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const year = parseYear(searchParams.get("year"))
  const province = parseProvince(searchParams.get("province"))
  const page = parsePage(searchParams.get("page"))
  const search = searchParams.get("search") ?? ""

  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }

      const nextQuery = params.toString()
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname

      startTransition(() => {
        router.replace(nextUrl, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const expected = new URLSearchParams()
    expected.set("year", String(year))
    expected.set("province", province)
    expected.set("page", String(page))

    if (search.trim()) {
      expected.set("search", search)
    }

    if (expected.toString() !== searchParams.toString()) {
      router.replace(`${pathname}?${expected.toString()}`, { scroll: false })
    }
  }, [page, pathname, province, router, search, searchParams, year])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchHolidays(year).then((data) => {
      if (!cancelled) {
        setHolidays(data)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [year])

  const filteredHolidays = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return holidays.filter((holiday) => {
      const matchesProvince =
        province === ALL_PROVINCES ||
        holiday.federal ||
        holiday.provinces.some((holidayProvince) => holidayProvince.id === province)

      const matchesSearch =
        normalizedSearch === "" ||
        holiday.nameEn.toLowerCase().includes(normalizedSearch) ||
        holiday.nameFr.toLowerCase().includes(normalizedSearch)

      return matchesProvince && matchesSearch
    })
  }, [holidays, province, search])

  const totalPages = Math.max(1, Math.ceil(filteredHolidays.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedHolidays = filteredHolidays.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    if (currentPage !== page) {
      updateQuery({ page: String(currentPage) })
    }
  }, [currentPage, page, updateQuery])

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Canadian Holidays</h1>
        <p className="text-sm text-gray-600">
          Filter by year and province, search by holiday name, and browse results
          10 at a time.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Year
          <select
            id="year-filter"
            className="rounded-md border border-gray-300 px-3 py-2 font-normal"
            value={year}
            onChange={(event) =>
              updateQuery({
                year: event.target.value,
                page: "1",
              })
            }
          >
            {YEARS.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Province
          <select
            id="province-filter"
            className="rounded-md border border-gray-300 px-3 py-2 font-normal"
            value={province}
            onChange={(event) =>
              updateQuery({
                province: event.target.value,
                page: "1",
              })
            }
          >
            <option value={ALL_PROVINCES}>All</option>
            {PROVINCES.map((provinceCode) => (
              <option key={provinceCode} value={provinceCode}>
                {provinceCode}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
          Search
          <input
            id="holiday-search"
            className="rounded-md border border-gray-300 px-3 py-2 font-normal"
            type="search"
            placeholder="Search holiday name"
            value={search}
            onChange={(event) =>
              updateQuery({
                search: event.target.value.trim() ? event.target.value : null,
                page: "1",
              })
            }
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table id="holidays-table" className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Name (FR)
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Province(s)
              </th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && paginatedHolidays.length > 0 ? (
              paginatedHolidays.map((holiday) => (
                <tr key={holiday.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">{holiday.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{holiday.nameEn}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{holiday.nameFr}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {getProvinceLabel(holiday)}
                  </td>
                </tr>
              ))
            ) : !isLoading ? (
              <tr className="border-t border-gray-200">
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No holidays match the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          id="prev-page"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1 || isPending}
          onClick={() => updateQuery({ page: String(currentPage - 1) })}
          type="button"
        >
          Previous
        </button>

        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </p>

        <button
          id="next-page"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= totalPages || isPending}
          onClick={() => updateQuery({ page: String(currentPage + 1) })}
          type="button"
        >
          Next
        </button>
      </div>
    </main>
  )
}
