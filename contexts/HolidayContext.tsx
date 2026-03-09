'use client'
import { createContext, useState, ReactNode } from "react";

interface Holiday {
  id: number;
  date: string;
  nameEn: string;
  nameFr: string;
  federal: boolean;
  provinces: {
    id: string;
  }[];
}

interface HolidayContextType {
  holidays: Holiday[];
  setHolidays: (holidays: Holiday[]) => void;
}

export const HolidayContext = createContext<HolidayContextType>({
  holidays: [],
  setHolidays: () => {},
});

export const HolidayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  return (
    <HolidayContext.Provider value={{ holidays, setHolidays }}>
      {children}
    </HolidayContext.Provider>
  );
}