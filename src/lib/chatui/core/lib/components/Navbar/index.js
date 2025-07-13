"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Navbar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _react = _interopRequireDefault(require("react"));
var _clsx2 = _interopRequireDefault(require("clsx"));
var _IconButton = require("../IconButton");
var _withPrefix = require("../../utils/withPrefix");
var Navbar = exports.Navbar = function Navbar(props) {
  var className = props.className,
    title = props.title,
    logo = props.logo,
    desc = props.desc,
    leftContent = props.leftContent,
    _props$rightContent = props.rightContent,
    rightContent = _props$rightContent === void 0 ? [] : _props$rightContent,
    rightSlot = props.rightSlot,
    align = props.align;
  var isLeft = align === 'left';
  var showTitle = isLeft ? true : !logo;
  return /*#__PURE__*/_react.default.createElement("header", {
    className: (0, _clsx2.default)((0, _withPrefix.withPrefix)('Navbar'), (0, _defineProperty2.default)({}, (0, _withPrefix.withPrefix)('Navbar--left'), isLeft), className)
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-left"))
  }, leftContent && /*#__PURE__*/_react.default.createElement(_IconButton.IconButton, (0, _extends2.default)({
    size: "lg"
  }, leftContent))), /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-main"))
  }, logo && /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-brand"))
  }, /*#__PURE__*/_react.default.createElement("img", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-logo")),
    src: logo,
    alt: title
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-inner"))
  }, showTitle && /*#__PURE__*/_react.default.createElement("h2", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-title"))
  }, title), /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-desc"))
  }, desc))), /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-right"))
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "".concat((0, _withPrefix.withPrefix)("Navbar-rightSlot"))
  }, rightSlot), rightContent.map(function (item) {
    return /*#__PURE__*/_react.default.createElement(_IconButton.IconButton, (0, _extends2.default)({
      size: "lg",
      key: item.icon
    }, item));
  })));
};