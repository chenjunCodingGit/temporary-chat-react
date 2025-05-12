import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React, { useState } from 'react';
import clsx from 'clsx';
import { IconButton } from './IconButton';
var UP = 'up';
var DOWN = 'down';
export var RateActions = function RateActions(props) {
  var _props$upTitle = props.upTitle,
    upTitle = _props$upTitle === void 0 ? UP : _props$upTitle,
    _props$downTitle = props.downTitle,
    downTitle = _props$downTitle === void 0 ? DOWN : _props$downTitle,
    onClick = props.onClick;
  var _useState = useState(''),
    _useState2 = _slicedToArray(_useState, 2),
    value = _useState2[0],
    setValue = _useState2[1];
  function handleClick(val) {
    setValue(val);
    onClick(val);
    if (!value) {}
  }
  function handleUpClick() {
    handleClick(UP);
  }
  function handleDownClick() {
    handleClick(DOWN);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "RateActions"
  }, /*#__PURE__*/React.createElement(IconButton, {
    className: clsx('RateBtn', {
      active: value === UP
    }),
    title: upTitle,
    "data-type": UP,
    icon: "thumbs-up",
    onClick: handleUpClick
  }), /*#__PURE__*/React.createElement(IconButton, {
    className: clsx('RateBtn', {
      active: value === DOWN
    }),
    title: downTitle,
    "data-type": DOWN,
    icon: "thumbs-down",
    onClick: handleDownClick
  }));
};