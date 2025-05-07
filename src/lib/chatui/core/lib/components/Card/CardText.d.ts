import React from 'react';
export type CardTextProps = {
    className?: string;
    textPosition?: 'left' | 'center' | 'right';
    children?: React.ReactNode;
};
export declare const CardText: React.FC<CardTextProps>;
