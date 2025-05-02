import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Input, InputProps } from '../Input';
import { SendConfirm } from '../SendConfirm';
import riseInput from './riseInput';
import parseDataTransfer from '../../utils/parseDataTransfer';
import canUse from '../../utils/canUse';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { toast } from '../Toast';

const canTouch = canUse('touch');

interface ComposerInputProps extends InputProps {
  invisible: boolean;
  inputRef: React.MutableRefObject<HTMLTextAreaElement>;
  onImageSend?: (file: File) => Promise<any>;
  onFileSelected?: (file: File, fileInfo: { name: string; extension: string; size: number },) => void;
}

export const ComposerInput = ({
  inputRef,
  invisible,
  onImageSend,
  onFileSelected,
  ...rest
}: ComposerInputProps) => {
  const fileInputRef = React.createRef<HTMLInputElement>();
  const [pastedImage, setPastedImage] = useState<File | null>(null);

  const handlePaste = useCallback((e: React.ClipboardEvent<any>) => {
    parseDataTransfer(e, setPastedImage);
  }, []);

  const handleImageCancel = useCallback(() => {
    setPastedImage(null);
  }, []);

  const handleImageSend = useCallback(() => {
    if (onImageSend && pastedImage) {
      Promise.resolve(onImageSend(pastedImage)).then(() => {
        setPastedImage(null);
      });
    }
  }, [onImageSend, pastedImage]);

  useEffect(() => {
    if (canTouch && inputRef.current) {
      const $composer = document.querySelector('.Composer');
      riseInput(inputRef.current, $composer);
    }
  }, [inputRef]);

  const onUploadClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
      if (allowedTypes.includes(fileExtension) && file.size <= maxSize) {
        const fileInfo = {
          name: file.name,
          extension: fileExtension,
          size: file.size
        };
        console.log('文件信息:', fileInfo);

        const formData = new FormData();
        formData.append('file', file);
        if (onFileSelected) {
          onFileSelected(file, fileInfo);
        }
      } else {
        if (!allowedTypes.includes(fileExtension)) {
          console.error('Not allowed file types, please select Word, Excel, PPT, or PDF files.');
          toast.fail('Not allowed file types, please select Word, Excel, PPT, or PDF files.');
        }
        if (file.size > maxSize) {
          console.error(`The file size exceeds 5MB, please choose a smaller file.`);
          toast.show('The file size exceeds 5MB, please choose a smaller file.')
        }
        // 清空选择的文件
        e.target.value = '';
      }
    }
  };

  return (
    <div className={clsx({ 'S--invisible': invisible }, 'Composer-input-wrap')}>
      <div
        className="Composer-input-upload"
      >
        <Button className={clsx("Toolbar-btn", "Toolbar-btnIcon-Button")} onClick={(e) => onUploadClick(e)}>
          <span className={clsx(["Toolbar-btnIcon", "Toolbar-btnIcon-upload"])} >
            <Icon type={'file'} className={clsx('Toolbar-Icon-loading')} />
          </span>
          {/* <span className="Toolbar-btnText">{'ddddd'}</span> */}
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Button>
      </div>
      <Input
        className="Composer-input"
        rows={1}
        autoSize
        enterKeyHint="send"
        onPaste={onImageSend ? handlePaste : undefined}
        ref={inputRef}
        {...rest}
      />
      {pastedImage && (
        <SendConfirm file={pastedImage} onCancel={handleImageCancel} onSend={handleImageSend} />
      )}
    </div>
  );
};
