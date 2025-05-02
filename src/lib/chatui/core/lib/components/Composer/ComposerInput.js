"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComposerInput = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Input = require("../Input");
var _SendConfirm = require("../SendConfirm");
var _riseInput = _interopRequireDefault(require("./riseInput"));
var _parseDataTransfer = _interopRequireDefault(require("../../utils/parseDataTransfer"));
var _canUse = _interopRequireDefault(require("../../utils/canUse"));
var _Button = require("../Button");
var _Icon = require("../Icon");
var _Toast = require("../Toast");
var _excluded = ["inputRef", "invisible", "onImageSend", "onFileSelected"];
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
var canTouch = (0, _canUse.default)('touch');
var ComposerInput = exports.ComposerInput = function ComposerInput(_ref) {
  var inputRef = _ref.inputRef,
    invisible = _ref.invisible,
    onImageSend = _ref.onImageSend,
    onFileSelected = _ref.onFileSelected,
    rest = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  var fileInputRef = /*#__PURE__*/_react.default.createRef();
  var _useState = (0, _react.useState)(null),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    pastedImage = _useState2[0],
    setPastedImage = _useState2[1];
  var handlePaste = (0, _react.useCallback)(function (e) {
    (0, _parseDataTransfer.default)(e, setPastedImage);
  }, []);
  var handleImageCancel = (0, _react.useCallback)(function () {
    setPastedImage(null);
  }, []);
  var handleImageSend = (0, _react.useCallback)(function () {
    if (onImageSend && pastedImage) {
      Promise.resolve(onImageSend(pastedImage)).then(function () {
        setPastedImage(null);
      });
    }
  }, [onImageSend, pastedImage]);
  (0, _react.useEffect)(function () {
    if (canTouch && inputRef.current) {
      var $composer = document.querySelector('.Composer');
      (0, _riseInput.default)(inputRef.current, $composer);
    }
  }, [inputRef]);
  var onUploadClick = function onUploadClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  var handleFileChange = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2.default)(/*#__PURE__*/_regenerator.default.mark(function _callee(e) {
      var _e$target$files;
      var file, allowedTypes, maxSize, fileExtension, fileInfo, formData;
      return _regenerator.default.wrap(function _callee$(_context) {
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
                  _Toast.toast.fail('Not allowed file types, please select Word, Excel, PPT, or PDF files.');
                }
                if (file.size > maxSize) {
                  console.error("The file size exceeds 5MB, please choose a smaller file.");
                  _Toast.toast.show('The file size exceeds 5MB, please choose a smaller file.');
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
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _clsx.default)({
      'S--invisible': invisible
    }, 'Composer-input-wrap')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "Composer-input-upload"
  }, /*#__PURE__*/_react.default.createElement(_Button.Button, {
    className: (0, _clsx.default)("Toolbar-btn", "Toolbar-btnIcon-Button"),
    onClick: function onClick() {
      return onUploadClick();
    }
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: (0, _clsx.default)(["Toolbar-btnIcon", "Toolbar-btnIcon-upload"])
  }, /*#__PURE__*/_react.default.createElement(_Icon.Icon, {
    type: 'file',
    className: (0, _clsx.default)('Toolbar-Icon-loading')
  })), /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    id: "fileInput",
    style: {
      display: 'none'
    },
    ref: fileInputRef,
    onChange: handleFileChange
  }))), /*#__PURE__*/_react.default.createElement(_Input.Input, (0, _extends2.default)({
    className: "Composer-input",
    rows: 1,
    autoSize: true,
    enterKeyHint: "send",
    onPaste: onImageSend ? handlePaste : undefined,
    ref: inputRef
  }, rest)), pastedImage && /*#__PURE__*/_react.default.createElement(_SendConfirm.SendConfirm, {
    file: pastedImage,
    onCancel: handleImageCancel,
    onSend: handleImageSend
  }));
};