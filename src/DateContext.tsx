import React, { createContext, useContext, PropsWithChildren, useState, useEffect } from 'react';
import { add, format } from 'date-fns';

interface IDateContext {
  weekday: string
  month: string
  year: string
  days: Weekday[]
}
interface IDateHandlersContext{
  incrementWeek: () => void
  decrementWeek: () => void
  setMood: (mood: Mood, date: Date) => void
  setFeeling: (mood: Mood, descriptor: string[], date: Date) => void
}

export type Weekday = {
  weekday: string;
  date: Date;
  isToday: boolean;
  log: Log | null;
};

export type Log = {
  feelings: {[feeling: string]: Mood};
  mood: Mood;
  date: string;
};

export enum Mood {
  happy,
  neutral,
  sad,
}

export const daysOfTheWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const indexByDay = Object.entries(daysOfTheWeek).reduce<{
  [day: string]: number;
}>((map, [index, day]) => {
  return { ...map, [day]: Number(index) };
}, {});

const makeWeekdays = (startDate: Date, logs: { [day: string]: Log }) => {
  const weekday = format(startDate, 'eeee');
  const todayIndex = indexByDay[weekday];

  return Object.entries(indexByDay).reduce((days, [weekday, index]) => {
    const date = add(startDate, {
      days: index - todayIndex,
    });
    const existingLog = logs?.[format(date, 'yyyy-MM-dd')] ?? null;

    return [
      ...days,
      {
        weekday,
        date,
        isToday: todayIndex === index,
        log: existingLog,
      },
    ];
  }, [] as Weekday[]);
};

const DateContext = createContext<IDateContext | undefined>(undefined);
const DateHandlersContext = createContext<IDateHandlersContext | undefined>( undefined);

export function DateProvider({ children }: PropsWithChildren<any>) {
  const [dailyLogs, setDailyLogs] = useState<{ [dateStamp: string]: Log }>({});

  useEffect(() => {
    const previousRecords = localStorage.getItem('records');
    if (previousRecords) {
      setDailyLogs(JSON.parse(previousRecords));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('records', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  const setMood = (mood: Mood, date: Date) => {
    setDailyLogs({
      ...dailyLogs,
      [format(date, 'yyyy-MM-dd')]: {
        ...dailyLogs[format(date, 'yyyy-MM-dd')],
        mood,
        date: format(date, 'yyyy-MM-dd'),
      },
    });
  };

  const setFeeling = (mood: Mood, descriptors: string[], date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    const prevLog = dailyLogs[formattedDate]
    const prevFeelings = prevLog?.feelings ?? {}
    const feelings = descriptors.reduce<{[feeling: string]: Mood}>((acc, d) => ({ ...acc, [d]: mood }), prevFeelings)

    setDailyLogs({
      ...dailyLogs,
      [formattedDate]: {
        ...prevLog,
        feelings,
      },
    });
  };

  const [startingDate, setStartingDate] = useState<Date>(new Date())

  function decrementWeek(){
    setStartingDate(add(startingDate, {days: -7}))
  }
  function incrementWeek(){
    setStartingDate(add(startingDate, {days: 7}))
  }

  const weekday = format(startingDate, 'eeee');
  const month = format(startingDate, 'MMMM');
  const year = format(startingDate, 'yyyy');
  const days = makeWeekdays(startingDate, dailyLogs);

  return (
    <DateContext.Provider value={{
      weekday,
      month,
      year,
      days
    }}>
      <DateHandlersContext.Provider value={{
        decrementWeek,
        incrementWeek,
        setMood,
        setFeeling
      }}>
        {children}
      </DateHandlersContext.Provider>
    </DateContext.Provider>
  )
}

export function useDate() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error(`useDate must be used within a DateProvider`)
  }

  return context
}

export function useDateHandlers() {
  const context = useContext(DateHandlersContext)
  if (context === undefined) {
    throw new Error(`useDateHandlers must be used within a DateProvider`)
  }

  return context
}
