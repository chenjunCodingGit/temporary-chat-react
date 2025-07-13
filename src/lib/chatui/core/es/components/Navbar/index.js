import _extends from "@babel/runtime/helpers/esm/extends";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import React from 'react';
import clsx from 'clsx';
import { IconButton } from '../IconButton';
import { withPrefix } from '../../utils/withPrefix';
export var Navbar = function Navbar(props) {
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
  return /*#__PURE__*/React.createElement("header", {
    className: clsx(withPrefix('Navbar'), _defineProperty({}, withPrefix('Navbar--left'), isLeft), className)
  }, /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-left"))
  }, leftContent && /*#__PURE__*/React.createElement(IconButton, _extends({
    size: "lg"
  }, leftContent))), /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-main"))
  }, logo && /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-brand"))
  }, /*#__PURE__*/React.createElement("img", {
    className: "".concat(withPrefix("Navbar-logo")),
    src: logo,
    alt: title
  })), /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-inner"))
  }, showTitle && /*#__PURE__*/React.createElement("h2", {
    className: "".concat(withPrefix("Navbar-title"))
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-desc"))
  }, desc))), /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-right"))
  }, /*#__PURE__*/React.createElement("div", {
    className: "".concat(withPrefix("Navbar-rightSlot"))
  }, rightSlot), rightContent.map(function (item) {
    return /*#__PURE__*/React.createElement(IconButton, _extends({
      size: "lg",
      key: item.icon
    }, item));
  })));
};