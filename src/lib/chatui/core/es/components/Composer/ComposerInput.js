import _extends from "@babel/runtime/helpers/esm/extends";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["inputRef", "invisible", "onImageSend", "onFileSelected"];
import _regeneratorRuntime from "@babel/runtime/regenerator";
import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Input } from '../Input';
import { SendConfirm } from '../SendConfirm';
import riseInput from './riseInput';
import parseDataTransfer from '../../utils/parseDataTransfer';
import canUse from '../../utils/canUse';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { toast } from '../Toast';
var canTouch = canUse('touch');
export var ComposerInput = function ComposerInput(_ref) {
  var inputRef = _ref.inputRef,
    invisible = _ref.invisible,
    onImageSend = _ref.onImageSend,
    onFileSelected = _ref.onFileSelected,
    rest = _objectWithoutProperties(_ref, _excluded);
  var fileInputRef = /*#__PURE__*/React.createRef();
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    pastedImage = _useState2[0],
    setPastedImage = _useState2[1];
  var handlePaste = useCallback(function (e) {
    parseDataTransfer(e, setPastedImage);
  }, []);
  var handleImageCancel = useCallback(function () {
    setPastedImage(null);
  }, []);
  var handleImageSend = useCallback(function () {
    if (onImageSend && pastedImage) {
      Promise.resolve(onImageSend(pastedImage)).then(function () {
        setPastedImage(null);
      });
    }
  }, [onImageSend, pastedImage]);
  useEffect(function () {
    if (canTouch && inputRef.current) {
      var $composer = document.querySelector('.Composer');
      riseInput(inputRef.current, $composer);
    }
  }, [inputRef]);
  var onUploadClick = function onUploadClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  var handleFileChange = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee(e) {
      var _e$target$files;
      var file, allowedTypes, maxSize, fileExtension, fileInfo, formData;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            file = (_e$target$files = e.target.files) === null || _e$target$files === void 0 ? void 0 : _e$target$files[0];
            if (file) {
              allowedTypes = ['.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.pdf'];
              maxSize = 5 * 1024 * 1024; // 5MB
              fileExtension = '.' + (file.name.split('.').pop() || '').toLowerCase();
              if (allowedTypes.includes(fileExtension) && file.size <= maxSize) {
                fileInfo = {
                  name: file.name,
                  extension: fileExtension,
                  size: file.size
                };
                console.log('文件信息:', fileInfo);
                formData = new FormData();
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
                  console.error("The file size exceeds 5MB, please choose a smaller file.");
                  toast.show('The file size exceeds 5MB, please choose a smaller file.');
                }
                // 清空选择的文件
                e.target.value = '';
              }
            }
          case 2:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return function handleFileChange(_x) {
      return _ref2.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: clsx({
      'S--invisible': invisible
    }, 'Composer-input-wrap')
  }, /*#__PURE__*/React.createElement("div", {
    className: "Composer-input-upload"
  }, /*#__PURE__*/React.createElement(Button, {
    className: clsx("Toolbar-btn", "Toolbar-btnIcon-Button"),
    onClick: function onClick() {
      return onUploadClick();
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: clsx(["Toolbar-btnIcon", "Toolbar-btnIcon-upload"])
  }, /*#__PURE__*/React.createElement(Icon, {
    type: 'file',
    className: clsx('Toolbar-Icon-loading')
  })), /*#__PURE__*/React.createElement("input", {
    type: "file",
    id: "fileInput",
    style: {
      display: 'none'
    },
    ref: fileInputRef,
    onChange: handleFileChange
  }))), /*#__PURE__*/React.createElement(Input, _extends({
    className: "Composer-input",
    rows: 1,
    autoSize: true,
    enterKeyHint: "send",
    onPaste: onImageSend ? handlePaste : undefined,
    ref: inputRef
  }, rest)), pastedImage && /*#__PURE__*/React.createElement(SendConfirm, {
    file: pastedImage,
    onCancel: handleImageCancel,
    onSend: handleImageSend
  }));
};