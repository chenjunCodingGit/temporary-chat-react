import React from 'react';
import clsx from 'clsx';
import { IconButton, IconButtonProps } from '../IconButton';
import { withPrefix } from '../../utils/withPrefix';

export type NavbarProps = {
  title: string;
  className?: string;
  logo?: string;
  leftContent?: IconButtonProps;
  rightContent?: IconButtonProps[];
  rightSlot?: React.ReactNode;
  desc?: React.ReactNode;
  align?: 'left' | 'center';
};

export const Navbar = (props: NavbarProps) => {
  const { className, title, logo, desc, leftContent, rightContent = [], rightSlot, align } = props;

  const isLeft = align === 'left';
  const showTitle = isLeft ? true : !logo;

  return (
    <header className={clsx(withPrefix('Navbar'), { [withPrefix('Navbar--left')]: isLeft }, className)}>
      <div className={`${withPrefix("Navbar-left")}`}>{leftContent && <IconButton size="lg" {...leftContent} />}</div>
      <div className={`${withPrefix("Navbar-main")}`}>
        {logo && (
          <div className={`${withPrefix("Navbar-brand")}`}>
            <img className={`${withPrefix("Navbar-logo")}`} src={logo} alt={title} />
          </div>
        )}
        <div className={`${withPrefix("Navbar-inner")}`}>
          {showTitle && <h2 className={`${withPrefix("Navbar-title")}`}>{title}</h2>}
          <div className={`${withPrefix("Navbar-desc")}`}>{desc}</div>
        </div>
      </div>
      <div className={`${withPrefix("Navbar-right")}`}>
        <div className={`${withPrefix("Navbar-rightSlot")}`}>{rightSlot}</div>
        {rightContent.map((item) => (
          <IconButton size="lg" key={item.icon} {...item} />
        ))}
      </div>
    </header>
  );
};
