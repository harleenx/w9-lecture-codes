import { Suspense } from "react"
import HolidaysClient from "./HolidaysClient"

export default function Home() {
  return (
    <Suspense fallback={<main className="p-8">Loading holidays...</main>}>
      <HolidaysClient />
    </Suspense>
  )
}
