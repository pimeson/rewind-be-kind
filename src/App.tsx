import React from 'react';
import './App.css';
import styled from 'styled-components';
import Day from './Day';
import Week from './Week';
import { daysOfTheWeek, useDate, useDateHandlers } from './DateContext';

interface AppProps {}

const StyledApp = styled.div`
  display: grid;
  min-height: 100vh;
  grid-template-columns: 1fr auto 1fr;
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

const indexByDay = Object.entries(daysOfTheWeek).reduce<{
  [day: string]: number;
}>((map, [index, day]) => {
  return { ...map, [day]: Number(index) };
}, {});

const makePrompt = (todayIndex: number) => {
  if (todayIndex <= 2) return 'Ready for the week?';
  if (todayIndex <= 5) return 'How is your week going?';
  return 'How was your week?';
};

function App({}: AppProps) {
  const { weekday, month, year, days } = useDate();

  const { setMood, setFeeling, expungeFeeling } = useDateHandlers();

  const dayIndex = indexByDay[weekday];

  return (
    <StyledApp className="bg-gray-100 antialiased text-gray-800">
      <div className="py-6" style={{ gridArea: 'title' }}>
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 bg-red-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-3xl" />
          <div className="relative bg-white shadow-lg rounded-3xl">
            <h1 className="font-sans font-semibold text-center w-full text-3xl text-gray-500 p-10">
              <span className="text-blue-400">Rewind</span> and{' '}
              <span className="text-red-400">Be Kind</span>
            </h1>
          </div>
        </div>
      </div>

      <h3 className="subtitle text-center mt-10 sm-mt-14 text-lg opacity-60 text-gray-600">
        {makePrompt(dayIndex)}
      </h3>
      <Week month={month} year={year}>
        {days.map((day) => (
          <Day
            setMood={setMood}
            key={day.weekday}
            day={day}
            setFeeling={setFeeling}
            expungeFeeling={expungeFeeling}
          />
        ))}
      </Week>
      {/*<div className="bg-white mx-12 shadow-2xl mb-10 rounded-xl" style={{gridArea: "goals"}}>*/}
      {/*  <h1></h1>*/}
      {/*</div>*/}
    </StyledApp>
  );
}

export default App;
