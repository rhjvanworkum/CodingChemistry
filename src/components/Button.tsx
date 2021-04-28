import {makeStyles} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';

const useStyles = makeStyles({
  Button: {
    height: '43px',
    width: '120px',
    BorderRadius: '6px',
    color: '#ffffff',
    backgroundColor: '#1D7DFF',
  },
  MenuButton: {
    position: 'absolute',
    left: '5%',
    bottom: '5%',
    height: '5%',
    width: '5%',
    backgroundColor: '#1D7DFF',
    borderRadius: '100%',
  },
  stripe: {
    position: 'absolute',
    left: '6%',
    bottom: '5%',
    background: '#FFFFFF',
    borderRadius: '5.8px',
  },
});

interface buttonProps {
  label?: string;
  clickHandler: any;
  style?: any;
}

const BlueButton : React.FC<buttonProps> = (props: buttonProps) => {
  const classes = useStyles();
  return (
    <Button {...props} className={classes.Button} onClick={props.clickHandler}>{props.label}</Button>
  );
};

export const MenuButton : React.FC<buttonProps> = (props : buttonProps) => {
  const classes = useStyles();

  return (
    <Button className={classes.MenuButton} onClick={props.clickHandler}>
      <div className={classes.stripe} style={{top: '33.33%', bottom: '63.1%'}} />
      <div className={classes.stripe} style={{top: '47.62%', bottom: '48.81%'}}/>
      <div className={classes.stripe} style={{top: '61.9%', bottom: '34.52%'}}/>
    </Button>
  );
};

export const ClearButton : React.FC<buttonProps> = (props : buttonProps) => {
  return (
    <ClearIcon style={{marginLeft: '5%', color: '#1D7DFF'}} onClick={props.clickHandler}/>
  );
};

export default BlueButton;