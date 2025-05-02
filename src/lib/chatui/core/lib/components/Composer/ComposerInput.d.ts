import React from 'react';
import { InputProps } from '../Input';
interface ComposerInputProps extends InputProps {
    invisible: boolean;
    inputRef: React.MutableRefObject<HTMLTextAreaElement>;
    onImageSend?: (file: File) => Promise<any>;
    onFileSelected?: (file: File, fileInfo: {
        name: string;
        extension: string;
        size: number;
    }) => void;
}
export declare const ComposerInput: ({ inputRef, invisible, onImageSend, onFileSelected, ...rest }: ComposerInputProps) => React.JSX.Element;
export {};
