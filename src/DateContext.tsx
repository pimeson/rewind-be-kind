import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import startOfMonth from 'date-fns/startOfMonth'
import add from 'date-fns/add'
import format from 'date-fns/format'
import getDay from 'date-fns/getDay';
import { subtract } from 'lodash';


interface IDateContext {
  weekday: string;
  month: string;
  year: string;
  days: Weekday[];
}

export enum Interval {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

function getIntervalDayLength(interval: Interval, daysInMonth: number): number {
  switch (interval) {
    case Interval.MONTH: return daysInMonth
    case Interval.WEEK: return 7
    default: return 1
  }
}

interface IDateHandlersContext {
  currentInterval: Interval;
  incrementInterval: () => void;
  decrementInterval: () => void;
  setMood: (mood: Mood, date: Date) => void;
  setFeeling: (mood: Mood, descriptor: string[], date: Date) => void;
  expungeFeeling: (feeling: string, date: Date) => void;
}

export function DateProvider(props: PropsWithChildren<{}>) {
  const [dailyLogs, setDailyLogs] = useState<{ [dateStamp: string]: Log }>({});
  const [interval, setInterval] = useState<Interval>(Interval.MONTH)

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
    const formattedDate = format(date, 'yyyy-MM-dd');
    const prevLog = dailyLogs[formattedDate];
    const prevFeelings = prevLog?.feelings ?? {};
    const feelings = descriptors.reduce<{ [feeling: string]: Mood }>(
      (acc, d) => ({ ...acc, [d]: mood }),
      prevFeelings,
    );

    setDailyLogs({
      ...dailyLogs,
      [formattedDate]: {
        ...prevLog,
        feelings,
      },
    });
  };

  const expungeFeeling = (feeling: string, date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const prevLog = dailyLogs[formattedDate];
    const { [feeling]: prevFeeling, ...rest } = prevLog.feelings;

    setDailyLogs({
      ...dailyLogs,
      [formattedDate]: {
        ...prevLog,
        feelings: rest,
      },
    });
  };

  const [startingDate, setStartingDate] = useState<Date>(new Date());
  const currentMonth = startingDate.getMonth();
  const currentYear = startingDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const intervalDayLength = getIntervalDayLength(interval, daysInMonth);

  function decrementInterval() {
    setStartingDate(add(startingDate, { days: -intervalDayLength }));
  }
  function incrementInterval() {
    setStartingDate(add(startingDate, { days: intervalDayLength }));
  }

  const weekday = format(startingDate, 'eeee');
  const month = format(startingDate, 'MMMM');
  const year = format(startingDate, 'yyyy');
  const days = makeDays(startingDate, intervalDayLength, dailyLogs);

  return (
    <DateContext.Provider
      value={{
        weekday,
        month,
        year,
        days,
      }}
    >
      <DateHandlersContext.Provider
        value={{
          currentInterval: interval,
          decrementInterval,
          incrementInterval,
          setMood,
          setFeeling,
          expungeFeeling,
        }}
      >
        {props.children}
      </DateHandlersContext.Provider>
    </DateContext.Provider>
  );
}

export type Weekday = {
  weekday: string;
  date: Date;
  log: Log | null;
};

export type Log = {
  feelings: { [feeling: string]: Mood };
  mood: Mood;
  date: string;
};

export enum Mood {
  happy = 'happy',
  neutral = 'neutral',
  sad = 'sad',
}

export const daysOfTheWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const indexByDay = Object.entries(daysOfTheWeek).reduce<{
  [day: string]: number;
}>((map, [index, day]) => {
  return { ...map, [day]: Number(index) };
}, {});

const makeDays = (startDate: Date, interval: number, logs: { [day: string]: Log }) => {
  const newDays: Weekday[] = [];


  if (interval === 7) {
    for (let i = 0; i < interval; i++) {  
      const date = add(startDate, {
        days: i,
      });
      const existingLog = logs?.[format(date, 'yyyy-MM-dd')] ?? null;
  
      newDays.push(
        {
          weekday: daysOfTheWeek[getDay(date)],
          date,
          log: existingLog,
        })
    }

    return newDays
  }

  const monthStart = startOfMonth(startDate)

  for (let j = 1; j <= getDay(monthStart); j++) {
    const date = add(monthStart, {
      days: -j,
    });

    const existingLog = logs?.[format(date, 'yyyy-MM-dd')] ?? null;

    newDays.unshift({
      weekday: daysOfTheWeek[getDay(date)],
      date,
      log: existingLog,
    })
  }

  for (let j = 0; j < interval; j++) {
      const date = add(monthStart, {
        days: j,
      });

      const existingLog = logs?.[format(date, 'yyyy-MM-dd')] ?? null;
  
      newDays.push(
        {
          weekday: daysOfTheWeek[getDay(date)],
          date,
          log: existingLog,
        })
  }

  const lastDay = newDays[newDays.length - 1]


  for (let j = 0; j < (6 - getDay(lastDay.date)); j++) {
    const date = add(monthStart, {
      days: interval + j,
    });

    const existingLog = logs?.[format(date, 'yyyy-MM-dd')] ?? null;

    newDays.push(
      {
        weekday: daysOfTheWeek[getDay(date)],
        date,
        log: existingLog,
      })
  }

  return newDays
};

const DateContext = createContext<IDateContext | undefined>(undefined);
const DateHandlersContext = createContext<IDateHandlersContext | undefined>(
  undefined,
);

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error(`useDate must be used within a DateProvider`);
  }

  return context;
}

export function useDateHandlers() {
  const context = useContext(DateHandlersContext);
  if (context === undefined) {
    throw new Error(`useDateHandlers must be used within a DateProvider`);
  }

  return context;
}
