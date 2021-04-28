import {Select, MenuItem} from '@material-ui/core';
import React, {SetStateAction, Dispatch, useState} from 'react';

interface selectPropsType {
  value: any,
  values?: any,
  setValue: Dispatch<SetStateAction<any>>,
  items: Array<any>
}

const SelectComponent : React.FC<selectPropsType> = (props: selectPropsType) => {
  const handleChange = (event: any) : void => {
    props.setValue(event.target.value);
  };
  return (
    <Select value={props.value} onChange={handleChange}>
      {props.items.map((item, index) => {
        return (
          <MenuItem key={index} value={item}>{item}</MenuItem>
        );
      })}
    </Select>
  );
};

export const ControlSelectComponent : React.FC<selectPropsType> = (props : selectPropsType) => {
  const [val, setVal] = useState(props.value);
  const handleChange = (event: any) : void => {
    props.setValue(event.target.value);
    setVal(event.target.value);
  };
  return (
    <Select value={val} onChange={handleChange}>
      {props.items.map((item, index) => {
        return (
          <MenuItem key={index} value={props.values[index]}>{item}</MenuItem>
        );
      })}
    </Select>
  );
};

export default SelectComponent;