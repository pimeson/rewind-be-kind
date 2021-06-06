import styled from 'styled-components';
import React from 'react';

export const StyledWeek = styled.div`
  grid-area: base;
`;

interface WeekProps extends React.HTMLAttributes<HTMLDivElement> {
  month: string;
  year: string;
}

export default function Week({ month, year, ...props }: WeekProps) {
  return (
    <StyledWeek className="px-6 md:px-12" {...props}>
      <h1 className="font-bold uppercase font text-2xl text-blue-600 opacity-70">
        {month} <span className="text-gray-500">{year}</span>
      </h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 xl:grid-cols-7 mb-8 mt-3">
        {props.children}
      </div>
    </StyledWeek>
  );
}
