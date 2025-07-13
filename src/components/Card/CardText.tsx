import React from 'react';
import clsx from 'clsx';

export type CardTextProps = {
  className?: string;
  textPosition?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
};

export const CardText: React.FC<CardTextProps> = (props) => {
  const { className, textPosition, children, ...other } = props;
  return (
    <div className={clsx('CardText', `CardText--${textPosition}` , className)} {...other}>
      {typeof children === 'string' ? <p>{children}</p> : children}
    </div>
  );
};
