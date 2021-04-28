import {TextField, makeStyles} from '@material-ui/core';
import React, {Dispatch, SetStateAction, useState} from 'react';

interface inputPropsType {
  label?: string,
  setValue: Dispatch<SetStateAction<any>>,
  value? : any
}

const useStyles = makeStyles({
  Input: {
    height: '43px',
    width: '150px',
    borderRadius: '5px',
    BackgroundColor: '#1D7DFF',
  },
  InputS: {
    height: '20px',
    width: '100px',
    borderRadius: '5px',
    BackgroundColor: '#1D7DFF',
  },
});

const InputComponent : React.FC<inputPropsType> = (props: inputPropsType) => {
  const classes = useStyles();
  const handleChange = (event : React.ChangeEvent<HTMLTextAreaElement>) : void => {
    props.setValue((event.target as HTMLTextAreaElement).value);
  };
  return (
    <TextField className={classes.Input} InputProps={{disableUnderline: true}} label={props.label} onChange={handleChange} />
  );
};

export const ControlInputComponent : React.FC<inputPropsType> = (props: inputPropsType) => {
  const classes = useStyles();
  const [val, setVal] = useState(props.value);
  const handleChange = (event : React.ChangeEvent<HTMLTextAreaElement>) : void => {
    props.setValue((event.target as HTMLTextAreaElement).value);
    setVal((event.target as HTMLTextAreaElement).value);
  };
  return (
    <TextField className={classes.Input} value={val} InputProps={{disableUnderline: true}} label={props.label} onChange={handleChange} />
  );
};

export const NumberInput : React.FC<inputPropsType> = (props : inputPropsType) => {
  const [val, setVal] = useState(props.value);
  const handleChange = (event : React.ChangeEvent<HTMLTextAreaElement>) : void => {
    setVal((event.target as HTMLTextAreaElement).value);
    if (!Number.isNaN(parseFloat((event.target as HTMLTextAreaElement).value))) {
      props.setValue(parseFloat((event.target as HTMLTextAreaElement).value));
    }
  };

  return (
    <TextField value={val} InputProps={{disableUnderline: false}} label={props.label} onChange={handleChange} />
  );
}

export default InputComponent;