import styled from 'styled-components';
import React from 'react';
import { Interval, useDateHandlers } from './DateContext';
import useScreenWidth from './hooks/useScreenWidth';
import capitalize from 'lodash/capitalize'

export const StyledView = styled.div`
  grid-area: base;
  display: grid;
  grid-template-rows: auto auto 1fr;
`;

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  month: string;
  year: string;
  interval: Interval;
}

export default function View({ month, year, interval, ...props }: ViewProps) {
  const { incrementInterval, decrementInterval } = useDateHandlers();
  const width = useScreenWidth();

  return (
    <StyledView className="px-12 md:px-24 mb-5" {...props}>
      <div className="flex mx-1 justify-between">
        <button
          onClick={decrementInterval}
          className="text-blue-400 hover:text-gray-100 sm:w-32 px-3 font-extrabold tracking-tight hover:bg-blue-400 py-2 hover:shadow"
        >
          {width > 700 ? `Last ${capitalize(interval)}` : 'Last'}
        </button>
        <h1 className="font-bold uppercase font text-2xl lead text-blue-600 opacity-70 flex align-text-bottom">
          {month} <span className="text-gray-500 ml-1">{year}</span>
        </h1>
        <button
          onClick={incrementInterval}
          className="text-red-400 hover:text-gray-100 sm:w-32 px-3 font-extrabold tracking-tight hover:bg-red-400 py-2 hover:shadow"
        >
          {width > 700 ? `Next ${capitalize(interval)}` : 'Next'}
        </button>
      </div>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:grid-cols-7 mb-8 mt-3">
        {props.children}
      </div>
    </StyledView>
  );
}
