import React from 'react';
export type CardActionsProps = {
    className?: string;
    direction?: 'column' | 'row';
    children?: React.ReactNode;
};
export declare const CardActions: React.FC<CardActionsProps>;
