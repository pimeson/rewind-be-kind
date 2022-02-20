import React, { FormEvent, useRef, useState } from 'react';
import { format, isToday } from 'date-fns';
import styled from 'styled-components';
import type { Log, Weekday } from './DateContext';
import { Mood } from './DateContext';

const moodMap = {
  [Mood.happy]: 'bg-green-100 text-green-400',
  [Mood.neutral]: 'bg-yellow-100 text-yellow-400',
  [Mood.sad]: 'bg-blue-100 text-blue-400',
};

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
  setFeeling: (mood: Mood, descriptor: string[], date: Date) => void;
  expungeFeeling: (feeling: string, date: Date) => void;
}

interface MoodProps extends React.HTMLAttributes<HTMLDivElement> {
  log: Log | null;
  onClick: () => void;
  mood: Mood;
  currentMood: Mood | null;
}

function MoodBtn({ log, mood, onClick, children, currentMood }: MoodProps) {
  const isActive = currentMood === mood;

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

export default function Day({
  day,
  setMood,
  setFeeling,
  expungeFeeling,
  ...defaultProps
}: DayProps) {
  const { className: overrideClassNames } = defaultProps;
  const { weekday, date, log } = day;
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const descriptorInput = useRef<HTMLInputElement>(null);

  let className = overrideClassNames
    ? overrideClassNames
    : 'flex flex-col bg-white h-72 rounded-lg shadow-md';

  if (isToday(date)) {
    className += ' border-4 border-red-700 border-opacity-25';
  }

  const handleMood = (mood: Mood, date: Date) => {
    // setMood(mood, date);
    setCurrentMood(mood);

    setIsFormVisible(true);
    descriptorInput.current && descriptorInput.current.focus();
  };

  const handleDescriptorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (descriptorInput.current && currentMood !== null) {
      const newDescriptors = descriptorInput.current.value.split(',');
      descriptorInput.current.value = '';
      setFeeling(currentMood, newDescriptors, date);
    }
  };

  return (
    <StyledDay
      className={className}
      onBlur={(e) => {
        const currentTarget = e.currentTarget;
        window.setTimeout(() => {
          if (!currentTarget.contains(document.activeElement)) {
            setCurrentMood(null);
            setIsFormVisible(false);
          }
        }, 100);
      }}
    >
      <h1 className="text-center font-semibold text-red-300 p-3">{weekday}</h1>
      <h2 className="text-center font-semibold text-gray-600 p-3">
        {format(date, 'd').toUpperCase()}
      </h2>
      <div className="mood-panel h-12">
        <MoodBtn
          log={log}
          currentMood={currentMood}
          onClick={() => handleMood(Mood.sad, date)}
          mood={Mood.sad}
        >
          🙁
        </MoodBtn>
        <MoodBtn
          log={log}
          currentMood={currentMood}
          onClick={() => handleMood(Mood.neutral, date)}
          mood={Mood.neutral}
        >
          😑️
        </MoodBtn>
        <MoodBtn
          log={log}
          currentMood={currentMood}
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
            {`Why did you feel ${currentMood} ${
              isToday(date) ? 'today' : `on ${weekday}`
            }?`}
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
      {log?.feelings && (
        <p className="justify-end m-3 flex flex-wrap">
          {Object.entries(log.feelings).map(([descriptor, mood]) => {
            return (
              <FeelingChip
                key={descriptor}
                expungeFeeling={() => {
                  expungeFeeling(descriptor, date);
                }}
                descriptor={descriptor}
                mood={mood}
              />
            );
          })}
        </p>
      )}
    </StyledDay>
  );
}

interface FeelingChipProps {
  descriptor: string;
  mood: Mood;
  expungeFeeling: () => void;
}

function FeelingChip({ descriptor, mood, expungeFeeling }: FeelingChipProps) {
  const [isHover, setIsHover] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      key={descriptor}
      className={`text-sm rounded-full ml-2 py-2 px-5 mt-1 text-left ${moodMap[mood]}`}
      onClick={expungeFeeling}
    >
      {isHover && <span className="text-red-500 font-bold">x </span>}
      {descriptor}
    </button>
  );
}
