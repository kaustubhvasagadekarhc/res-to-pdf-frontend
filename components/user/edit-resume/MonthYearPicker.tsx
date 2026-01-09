"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Calendar } from "lucide-react";

interface MonthYearPickerProps {
  value: string; // Format: "Jan - 2024" or empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const MONTHS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate years from 1980 to current year + 5
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 1980; year <= currentYear + 5; year++) {
    years.push(year);
  }
  return years.reverse(); // Most recent first
};

// Get days in a month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get first day of month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

export const MonthYearPicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  error = false,
  disabled = false,
}: MonthYearPickerProps) => {
  // Helper function to parse value and return display values
  const parseValue = useCallback((val: string) => {
    if (val) {
      // Parse "Jan - 2024" or "January - 2024" format
      const match = val.match(/^([a-zA-Z]+)\s*-\s*(\d{4})$/);
      if (match) {
        const monthName = match[1].toLowerCase();
        const year = parseInt(match[2], 10);
        
        // Find month index
        const monthIndex = MONTHS.findIndex(
          (m) => m.label.toLowerCase() === monthName || 
                 SHORT_MONTHS[m.value].toLowerCase() === monthName
        );
        
        if (monthIndex !== -1 && !isNaN(year)) {
          return {
            month: MONTHS[monthIndex].value,
            year: year,
            day: 1,
          };
        }
      }
    }
    
    // Default to current date if value is empty or invalid
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
      day: null as number | null,
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(() => parseValue(value).month);
  const [displayYear, setDisplayYear] = useState(() => parseValue(value).year);
  const [selectedDay, setSelectedDay] = useState<number | null>(() => parseValue(value).day);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousValueRef = useRef<string | undefined>(value);

  // Parse value on mount or when value changes
  useEffect(() => {
    // Only update if value actually changed
    if (previousValueRef.current === value) {
      return;
    }
    previousValueRef.current = value;

    const parsed = parseValue(value);
    
    // Schedule state updates outside the effect
    queueMicrotask(() => {
      setDisplayMonth(parsed.month);
      setDisplayYear(parsed.year);
      setSelectedDay(parsed.day);
    });
  }, [value, parseValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthChange = (monthIndex: number) => {
    setDisplayMonth(monthIndex);
  };

  const handleYearChange = (year: number) => {
    setDisplayYear(year);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const formatted = `${SHORT_MONTHS[displayMonth]} - ${displayYear}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(displayMonth, displayYear);
  const firstDay = getFirstDayOfMonth(displayMonth, displayYear);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  // Format display value
  const getDisplayValue = () => {
    if (!value) return placeholder;
    
    const match = value.match(/^([a-zA-Z]+)\s*-\s*(\d{4})$/);
    if (match) {
      const monthName = match[1];
      const year = match[2];
      // Convert short month to full month name for display
      const monthIndex = SHORT_MONTHS.findIndex(
        (m) => m.toLowerCase() === monthName.toLowerCase()
      );
      if (monthIndex !== -1) {
        const fullMonthName = MONTHS[monthIndex].label;
        const day = selectedDay || 1;
        return `${fullMonthName} ${day}, ${year}`;
      }
    }
    return value;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-white border rounded-sm px-4 py-3 border-b border-gray-300 transition-all duration-200 focus:outline-none focus:border-b-2 text-slate-700 flex items-center justify-between ${
          error
            ? "border-rose-500 focus:border-rose-500"
            : "border-slate-300 focus:border-[var(--primary)]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
          !value ? "text-slate-400" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{getDisplayValue()}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg w-full min-w-[320px]">
          <div className="p-4">
            {/* Month and Year Dropdowns */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <select
                  value={displayMonth}
                  onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select
                  value={displayYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-md px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {generateYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-slate-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-md transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

