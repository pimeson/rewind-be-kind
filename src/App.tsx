import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import styled from 'styled-components';
import { add, format } from 'date-fns';

interface AppProps {}

const StyledApp = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr 500px 1fr;
  grid-template-rows: 200px 100px auto 800px;
  grid-template-areas:
    'header title header2'
    'spacer subtitle spacer2'
    'base   base  base'
    'goals goals goals';
  
  .subtitle {
    font-weight: lighter;
    grid-area: subtitle;
  }
`;

const Lanes = styled.div`
  display: grid;
  grid-area: base;
  margin-top: 60px;
  grid-column-gap: 20px;
`;

const StyledLane = styled.div`
`;

interface LaneProps extends React.HTMLAttributes<HTMLDivElement> {
  day: Weekday;
}

type Weekday = {
  weekday: string;
  date: Date;
  isToday: boolean;
};

const Lane: React.FC<LaneProps> = ({ day, ...defaultProps }) => {
  const { className: overrideClassNames } = defaultProps;

  let className = overrideClassNames
    ? overrideClassNames
    : 'bg-white h-96 rounded-lg shadow-md';

  if (day.isToday) {
    className += ' border-4 border-red-700 border-opacity-25';
  }

  return (
    <StyledLane className={className}>
      <h1 className="text-center font-semibold text-red-300 p-3">
        {day.weekday}
      </h1>
      <h2 className="text-center font-semibold text-gray-600 p-3">
        {format(day.date, 'd').toUpperCase()}
      </h2>
    </StyledLane>
  );
};

const daysOfTheWeek = [
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

const makeWeekdays = () => {
  const today = new Date();
  const weekday = format(today, 'eeee');
  const todayIndex = indexByDay[weekday];

  return Object.entries(indexByDay).reduce((days, [weekday, index]) => {
    return [
      ...days,
      {
        weekday,
        date: add(today, {
          days: index - todayIndex,
        }),
        isToday: todayIndex === index,
      },
    ];
  }, [] as Weekday[]);
};

const makePrompt = (todayIndex) => {
  if (todayIndex <= 2) return "Ready for the week?"
  if (todayIndex <= 5) return "How is your week going?"
  return "How was your week?"
}

function App({}: AppProps) {
  const today = new Date();
  const weekday = format(today, 'eeee');
  const todayIndex = indexByDay[weekday];
  const days = makeWeekdays();

  // App will play a replay of your week based off of the flexible goals that you have set for yourself.

  return (
    <StyledApp className="bg-gray-100">
      <div className="py-6 sm:py-12" style={{ gridArea: 'title' }}>
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 bg-red-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative bg-white shadow-lg sm:rounded-3xl">
            <h1 className="font-sans font-semibold text-center w-full text-3xl text-blue-400 p-10">
              Be Kind Rewind
            </h1>
          </div>
        </div>
      </div>

      <h3 className="subtitle text-center mt-14 text-lg opacity-60">
        {makePrompt(todayIndex)}
      </h3>

      <Lanes className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:grid-cols-7 mb-8 mx-12">
        {days.map((day) => (
          <Lane key={day.weekday} day={day} />
        ))}
      </Lanes>
      <div className="bg-white mx-12 shadow-2xl mb-10 rounded-xl" style={{gridArea: "goals"}}>
        <h1></h1>
      </div>
    </StyledApp>
  );
}

export default App;
