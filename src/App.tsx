import React, { useEffect, useState } from 'react';
import './App.css';
import styled from 'styled-components';
import { add, format } from 'date-fns';
import Day from './Day';
import Week from './Week';

interface AppProps {}

const StyledApp = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr 500px 1fr;
  grid-template-rows: 200px 100px auto auto;
  grid-template-areas:
    'header title header2'
    'spacer subtitle spacer2'
    'base   base  base'
    'goals goals goals';

  .subtitle {
    grid-area: subtitle;
  }
`;

export type Weekday = {
  weekday: string;
  date: Date;
  isToday: boolean;
  log: Log | null;
};

export const daysOfTheWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const indexByDay = Object.entries(daysOfTheWeek).reduce<{
  [day: string]: number;
}>((map, [index, day]) => {
  return { ...map, [day]: Number(index) };
}, {});

const makeWeekdays = (logs: { [day: string]: Log }) => {
  const today = new Date();

  const weekday = format(today, 'eeee');
  const todayIndex = indexByDay[weekday];

  return Object.entries(indexByDay).reduce((days, [weekday, index]) => {
    const date = add(today, {
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

const makePrompt = (todayIndex: number) => {
  if (todayIndex <= 2) return 'Ready for the week?';
  if (todayIndex <= 5) return 'How is your week going?';
  return 'How was your week?';
};

export enum Mood {
  happy,
  neutral,
  sad,
}

export type Log = {
  mood: Mood;
  date: string;
};

function App({}: AppProps) {
  const today = new Date();
  const weekday = format(today, 'eeee');
  const month = format(today, 'MMMM');
  const year = format(today, 'yyyy');
  const todayIndex = indexByDay[weekday];
  const [dailyLogs, setDailyLogs] = useState<{ [dateStamp: string]: Log }>({});

  // App will play a replay of your week based off of the flexible goals that you have set for yourself.
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
        mood,
        date: format(date, 'yyyy-MM-dd'),
      },
    });
  };

  const days = makeWeekdays(dailyLogs);

  return (
    <StyledApp className="bg-gray-100 antialiased text-gray-800">
      <div className="py-6 sm:py-12" style={{ gridArea: 'title' }}>
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 bg-red-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative bg-white shadow-lg sm:rounded-3xl">
            <h1 className="font-sans font-semibold text-center w-full text-3xl text-gray-500 p-10">
              <span className="text-blue-400">Rewind</span> and{' '}
              <span className="text-red-400">Be Kind</span>
            </h1>
          </div>
        </div>
      </div>

      <h3 className="subtitle text-center mt-14 text-lg opacity-60 text-gray-600">
        {makePrompt(todayIndex)}
      </h3>
      <Week month={month} year={year}>
        {days.map((day) => (
          <Day setMood={setMood} key={day.weekday} day={day} />
        ))}
      </Week>
      {/*<div className="bg-white mx-12 shadow-2xl mb-10 rounded-xl" style={{gridArea: "goals"}}>*/}
      {/*  <h1></h1>*/}
      {/*</div>*/}
    </StyledApp>
  );
}

export default App;
