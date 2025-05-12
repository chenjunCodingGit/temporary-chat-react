import React, { useState } from 'react';
import clsx from 'clsx';
import { IconButton } from './IconButton';

const UP = 'up';
const DOWN = 'down';

export type RateActionsProps = {
  upTitle?: string;
  downTitle?: string;
  onClick: (value: string) => void;
};

export const RateActions: React.FC<RateActionsProps> = (props) => {

  const { upTitle = UP, downTitle = DOWN, onClick } = props;
  const [value, setValue] = useState('');

  function handleClick(val: string) {
    setValue(val);
    onClick(val);
    if (!value) {
    }
  }

  function handleUpClick() {
    handleClick(UP);
  }

  function handleDownClick() {
    handleClick(DOWN);
  }

  return (
    <div className="RateActions">
      {(
        <IconButton
          className={clsx('RateBtn', { active: value === UP })}
          title={upTitle}
          data-type={UP}
          icon="thumbs-up"
          onClick={handleUpClick}
        />
      )}
      {(
        <IconButton
          className={clsx('RateBtn', { active: value === DOWN })}
          title={downTitle}
          data-type={DOWN}
          icon="thumbs-down"
          onClick={handleDownClick}
        />
      )}
    </div>
  );
};