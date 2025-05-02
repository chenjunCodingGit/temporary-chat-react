import React from 'react';
export type CardTitleProps = {
    className?: string;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    center?: boolean;
    children?: React.ReactNode;
};
export declare const CardTitle: React.FC<CardTitleProps>;
