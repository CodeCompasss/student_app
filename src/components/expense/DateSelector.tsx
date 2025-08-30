'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type DateItem = {
  iso: string;
  date: number;
  day: string;
  fullDate: Date;
  month: string;
  year: number;
};

type DateSelectorProps = {
  selectedDate: string; // typically 'YYYY-MM-DD'
  onDateChange: (date: string) => void;
};

function buildDatesAround(base: Date, before = 15, after = 15): DateItem[] {
  const dates: DateItem[] = [];
  for (let i = -before; i <= after; i++) {
    const d = new Date(base.getTime());
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0] || '';
    dates.push({
      date: d.getDate(),
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: d,
      iso,
      month: d.toLocaleDateString('en-US', { month: 'long' }),
      year: d.getFullYear(),
    });
  }
  return dates;
}


export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [dates, setDates] = useState<DateItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledOnce = useRef(false);
  const EXTEND_CHUNK = 30;

  useEffect(() => {
    const initialDates = buildDatesAround(new Date(), 15, 15);
    setDates(initialDates);
  }, []);

  // 2. Center the selected date
  useEffect(() => {
    if (!selectedDate || !containerRef.current) return;

    let index = dates.findIndex((d) => d.iso === selectedDate);
    if (index === -1) {
      // extend list around selectedDate to include it
      const base = new Date(selectedDate);
      const extended = buildDatesAround(base, EXTEND_CHUNK, EXTEND_CHUNK);
      setDates((prev) => {
        // merge without duplicates
        const map = new Map<string, DateItem>();
        [...prev, ...extended].forEach((it) => map.set(it.iso, it));
        return Array.from(map.values()).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
      });
      return;
    }

    const container = containerRef.current;
    const item = container.children[index] as HTMLElement;
    if (!item) return;

    const scrollPosition =
      item.offsetLeft - container.clientWidth / 2 + item.clientWidth / 2;

    container.scrollTo({
      left: scrollPosition,
      behavior: hasScrolledOnce.current ? 'smooth' : 'auto',
    });

    hasScrolledOnce.current = true;
  }, [selectedDate, dates]);

  const onScroll = useCallback(() => {
    const container = containerRef.current;
    const localDates = dates;
    if (!container || localDates.length === 0) return;

    const nearLeft = container.scrollLeft < 40;
    const nearRight = container.scrollWidth - container.clientWidth - container.scrollLeft < 40;

    if (nearLeft) {
      const first = localDates[0].fullDate;
      const before = buildDatesAround(new Date(first), EXTEND_CHUNK, 0);
      setDates((prev) => [...before.slice(0, EXTEND_CHUNK), ...prev]);
      container.scrollLeft += 58 * EXTEND_CHUNK; // keep visual position roughly stable
    }
    if (nearRight) {
      const last = localDates[localDates.length - 1].fullDate;
      const after = buildDatesAround(new Date(last), 0, EXTEND_CHUNK);
      setDates((prev) => [...prev, ...after.slice(1)]);
    }
  }, [dates]);

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-auto gap-3 mt-4 px-2 scrollbar-hide text-black"
      onScroll={onScroll}
    >
      {dates.map(({ day, date, month, year, iso }, i) => {
        const isFirstOfMonth = dates[i + 1]?.date === 1;
        const active = iso === selectedDate;

        return (
          <div
            key={i}
            className="relative flex items-center cursor-pointer"
            onClick={() => onDateChange(iso)}
          >
            <div
              className={`flex flex-col items-center justify-between border-black border-2 rounded-[21px] w-[58px] h-[91.46px] py-[11px] px-[15px] text-sm ${
                active ? 'bg-blue-400 text-white' : ''
              }`}
            >
              <span className="text-gray-700">{day}</span>
              <span className="font-bold">{date}</span>
            </div>

            {isFirstOfMonth && (
              <div className="flex flex-col justify-center items-center text-center text-xs leading-none font-semibold mt-1 pl-[12px]">
                <div className="underline w-[54px] h-[24px] font-inter font-medium text-[20px] leading-[100%]">
                  {month}
                </div>
                <div className="w-[54px] h-[19px] font-inter font-medium text-[16px] leading-[100%]">
                  {year}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
