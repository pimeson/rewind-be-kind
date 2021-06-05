import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import styled from 'styled-components';
import type { Log, Weekday } from './App';
import { Mood } from './App';

const StyledDay = styled.div`
  .mood-panel {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }
`;

const StyledMoodBtn = styled.button<{ log: Log | null; mood: Mood }>`
  padding: 3px;
  display: inline-block;
`;

interface DayProps extends React.HTMLAttributes<HTMLDivElement> {
  day: Weekday;
  setMood: (mood: Mood, date: Date) => void;
}

interface MoodProps extends React.HTMLAttributes<HTMLDivElement> {
  log: Log | null;
  onClick: () => void;
  mood: Mood;
}

function MoodBtn({ log, mood, onClick, children }: MoodProps) {
  const isActive = log?.mood === mood;

  return (
    <StyledMoodBtn
      className={`focus:outline-none rounded-full w-12 text-2xl ${
        isActive ? 'border-4 border-opacity-25 border-blue-700' : ''
      }`}
      log={log}
      mood={Mood.sad}
      onClick={onClick}
    >
      {children}
    </StyledMoodBtn>
  );
}

export default function Day({ day, setMood, ...defaultProps }: DayProps) {
  const { className: overrideClassNames } = defaultProps;
  const { weekday, isToday, date, log } = day;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [descriptors, setDescriptors] = useState<string[] | null>(null);
  const descriptorInput = useRef<HTMLInputElement>(null);

  let className = overrideClassNames
    ? overrideClassNames
    : 'flex flex-col bg-white h-96 rounded-lg shadow-md';

  if (isToday) {
    className += ' border-4 border-red-700 border-opacity-25';
  }

  const handleMood = (mood: Mood, date: Date) => {
    setMood(mood, date);

    setIsFormVisible(true);
    descriptorInput.current && descriptorInput.current.focus();
  };

  const handleDescriptorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (descriptorInput.current) {
      setDescriptors(descriptorInput.current.value.split(','));
    }
  };

  return (
    <StyledDay
      className={className}
      onBlur={(e) => {
        const currentTarget = e.currentTarget;
        window.setTimeout(() => {
          if (!currentTarget.contains(document.activeElement)) {
            setIsFormVisible(false);
          }
        }, 100);
      }}
    >
      <h1 className="text-center font-semibold text-red-300 p-3">{weekday}</h1>
      <h2 className="text-center font-semibold text-gray-600 p-3">
        {format(date, 'd').toUpperCase()}
      </h2>
      <div className="mood-panel">
        <MoodBtn
          log={log}
          onClick={() => handleMood(Mood.sad, date)}
          mood={Mood.sad}
        >
          🙁
        </MoodBtn>
        <MoodBtn
          log={log}
          onClick={() => handleMood(Mood.neutral, date)}
          mood={Mood.neutral}
        >
          😑️
        </MoodBtn>
        <MoodBtn
          log={log}
          onClick={() => handleMood(Mood.happy, date)}
          mood={Mood.happy}
        >
          😄️
        </MoodBtn>
      </div>
      {isFormVisible && (
        <form
          onSubmit={handleDescriptorSubmit}
          className="flex flex-col justify-center mt-5 p-3 mx-2"
        >
          <label
            className="tracking-tighter text-sm font-medium text-gray-500 ml-0.5"
            htmlFor={`day-descriptor-${weekday}`}
          >
            How would you describe your day?
          </label>
          <input
            autoFocus
            className="mt-2 appearance-none border-2 border-gray-200 rounded py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            id={`day-descriptor-${weekday}`}
            type="text"
            ref={descriptorInput}
          />
        </form>
      )}
      <div className="flex-1" />
      {descriptors && (
        <p className="justify-end m-3">
          {descriptors.map((description) => (
            <span
              key={description}
              className="text-xs bg-green-100 rounded-full ml-2 py-2 px-3 text-green-400"
            >
              {description}
            </span>
          ))}
        </p>
      )}
    </StyledDay>
  );
}
